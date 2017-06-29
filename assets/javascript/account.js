var currentPage = "account";
var myDbxId = "0ot1htkfrv9jzeg";
var userBox;
var myProjects = [];


firebase.auth().onAuthStateChanged(function(user){
	if (user){
		authUser = user;
		usersEndPoint.once("value",function(snapshot){
			if (snapshot.hasChild(user.uid)){
			//if the user already exists
				currentUser = snapshot.child(user.uid).val();
			} else {
				currentUser = new User();  //create a user using default values
			}
			//print account info
			printAccountInfo(currentUser);
		
			//check to see if I just got sent here from dropbox auth
			if(currentUser.dropBoxToken === "0"){
				if (isAuthenticated()){
					//already authenticated, show
					currentUser.dropBoxToken = getAccessTokenFromUrl();
					usersEndPoint.child(currentUser.key).update(currentUser)
					userBox = new Dropbox({accessToken: currentUser.dropBoxToken});
					var downloadLink;
					//audio dropbox button
					buildDropboxButton(currentUser, "audio", "User", $("#audioButtonHolder"));
					//photo dropbox button
					buildDropboxButton(currentUser, "images", "User", $("#photoBoxHolder"));
				}	
			}else{
				userBox = new Dropbox({accessToken: currentUser.dropBoxToken});
				var downloadLink;
				//audio dropbox button for user
				buildDropboxButton(currentUser, "audio", "User", $("#audioButtonHolder"));
				//photo dropbox button
				buildDropboxButton(currentUser, "images", "User", $("#photoBoxHolder"));
			}
		});
	} else {
		//no user is signed in
		window.location = "index.html";
	}
		
});
//remove edit
//remove audio source from profile
$("body").on("click",".removeAudio",function(){
	var index = $(this).attr("data-index");
	if ($(this).attr("data-key") !== undefined){
		var key = $(this).attr("data-key");
		projectsEndPoint.child(key).child("audioURLs").child(index).update("");
	} else {
		currentUser.audioURLs[index] = "";
		usersEndPoint.child(currentUser.key).update(currentUser);
	}
	$(this).parent().remove();
	
})

function printAccountInfo(user){
	$("#userName").text(user.name);
	$("#userBio").text(user.bio);
	$("#userEmail").text(user.email);
	//the "profilePicture img needs to have its id changed"
	$("#profilePicture").attr("id","img"+user.key);
	$("#img"+user.key).attr("src", user.imageURL).attr("style", "background-image: url('"+user.imageURL+"');").addClass("crop");
	$("#userProfileLink").text(window.location.origin + "/codeRed/profile.html#"+user.key);
	printAllAudio(user,true);
	//get projects
	projectsEndPoint.on("child_added",function(snapshot){
		var myProject = snapshot.val();
		if(myProject.userKey === currentUser.key){
			myProjects.push(myProject);
			printProjectSnippet(myProject.key,true);
		}
		
	});
}


////////////////////////////////
////  Modals  //////////////////
////////////////////////////////

////  Project Modal ////////////
$("#openNewProject").on("click",function(){
	//change title
	$("#modalTitle").text("Create New Project");
	//add a data-key
	$("#submitProject").attr("data-key","new");
});

$("#projectSampleHolder").on("click",".openEditProject",function(){
	//change title
	$("#modalTitle").text("Edit Project Details");
	//add a data-key
	$("#submitProject").attr("data-key",$(this).attr("data-key"));
});



$("#needsAdd").on("click", function() {
	if ($("#newProjectNeeds").val().trim().length > 0 ) {
		addNeed();
	}
});

$("#wantsAdd").on("click", function() {
	if ($("#newProjectWants").val().trim().length > 0 ) {
		addWant();
	}
});

//add a need(along with a remove button) to the needs list on the modal, and add clear the need input
function addNeed(){
	var userNeed = $("#newProjectNeeds").val().trim();
	var needDiv = $("<div>").addClass("needHolder");

	$("#needList").append(needDiv).append("<li><span class='inputNewNeed'>" + userNeed + "</span> <button class='removeMe'>Remove</button></li>");

	$("#newProjectNeeds").val("");
}

//add a want(along with a remove button) to the wants list on the modal, and add clear the need input
function addWant(){
	var userWant = $("#newProjectWants").val().trim();
	var wantDiv = $("<div>").addClass("wantHolder");

	$("#wantList").append(wantDiv).append("<li><span class='inputNewWant'>" + userWant + " </span><button class='removeMe'>Remove</button></li>");

	$("#newProjectWants").val("");
}

//enables the reomve button on each need/want to remove selected list item on create project modal
$("body").on("click", ".removeMe", function() {
	$(this).parent().remove();
});
//creates a new project from the create project modal
function createProject() {
	var name = $("#newProjectTitle").val().trim();
	var email = $("#newProjectEmail").val().trim();
	var description = $("#newProjectInfo").val().trim();
	var genre = $("#newProjectGenre").val().trim();
	var needs = [""];
	var wants = [""];
	$(".inputNewNeed").each(function(index) {
		needs.push($(this).text());
	})
	$(".inputNewWant").each(function(index) {
		wants.push($(this).text());
	})
	var newProject = new Project(name,email,description,genre,needs,wants)
}

//edits an existing project
//the project's key should be attached to its edit button.
function editProject(key){
	var name = $("#newProjectTitle").val().trim();
	var email = $("#newProjectEmail").val().trim();
	var description = $("#newProjectInfo").val().trim();
	var genre = $("#newProjectGenre").val().trim();
	var needs = [""];
	var wants = [""];
	$(".inputNewNeed").each(function(index) {
		needs.push($(this).text());
	});
	$(".inputNewWant").each(function(index) {
		wants.push($(this).text());
	});
	var index;
	//get project
	for(var i = 0; i< myProjects.length; i++){
		if(myProjects[i].key === key){
			index = i;
			break;
		}
	}

	//validate
	if (name != ""){
		myProjects[index].name = name;
	}
	if (email != ""){
		myProjects[index].email = email;
	}
	if (description != ""){
		myProjects[index].description = description;
	}
	if (genre != ""){
		myProjects[index].genre = genre;
	}
	if(needs[1] !== undefined){
		myProjects[index].needs = needs;
	}
	if(wants[1] !== undefined){
		myProjects[index].wants = wants;
	}
	//update
	projectsEndPoint.child(key).update(myProjects[index]);
}

$("#submitProject").on("click", function() {
	//now needs dual functionality, based on edit/create
	var myKey = $(this).attr("data-key");
	if(myKey === "new"){
		createProject();
	} else{
		editProject(myKey);
		//after edit it does not refresh on the screen
	}
	
	$(".projectInput").val("");
	$(".inputNewNeed").parent().remove();
	$(".inputNewWant").parent().remove();
	$("#newProject").modal("hide");
});

$("#closeProject").on("click", function(){
	//clrear all fields on the modal
	$(".projectInput").val("");
	$(".inputNewNeed").parent().remove();
	$(".inputNewWant").parent().remove();
});

/////////    Confirm Remove Modal /////////
$("#projectSampleHolder").on("click",".openModConfirm",function(){
	//add a data-key to the sumbit button
	$("#modConfirmYes").attr("data-key",$(this).attr("data-key"));
	//add type "project"
	$("#modConfirmYes").attr("data-rmType","Project");
	//then the modal will show
});

function removeItem(key, type){
	if (type === "Project"){
		//to remove a project, it needs to be removed in a few places
		//1. remove from the projects endpoit
		projectsEndPoint.child(key).remove();
		//2. remove from the list
		$("#sample"+key).remove();
		//3. remove files from storage
		//bug
		//this doesn't work because directeries cannot be deleted.
		//I will have to add files paths to the projects(or someting)
		firebase.storage().ref().child("Projects/"+key).delete().catch(function(error){
			console.log(error);
		});
	}
}


$("#modConfirmYes").on("click",function(){
	var key = $(this).attr("data-key");
	var type = $(this).attr("data-rmType");

	removeItem(key,type);
	$("#modConfirm").modal("hide");
});


/////////   User Modal  ///////////////
//users are created on login with default values
function updateUser(user) {
	var name = $("#newName").val().trim();
	var email = $("#newEmail").val().trim();
	var bio = $("#newBio").val().trim();
	if (name != ""){
		user.name = name;
	}
	if (email != ""){
		user.email = email;
	}
	if (bio != ""){
		user.bio = bio;
	}
	$("#userName").text(user.name);
	$("#userBio").text(user.bio);
	$("#userEmail").text(user.email);
	usersEndPoint.child(user.key).update(user);
}

$("#submitAccount").on("click",function(){
	updateUser(currentUser);
	$("#newName").val("");
	$("#newEmail").val("");
	$("#newBio").val("");
	$("#myAccountEdit").modal("hide");
})


////////////////////////////////
////  DropBox  /////////////////
////////////////////////////////

function buildDropboxButton(user,fileType, objectType, $appender){
	options = {
	    success: function(files) {
	    	downloadLink = files[0].link;
			storeInServer(user,downloadLink,fileType,objectType,$appender);
	    },
	    cancel: function() {},
	    linkType: "preview",
	    extensions: [fileType],
	};
	var button = Dropbox.createChooseButton(options);
	$appender.append(button);
}

function storeInServer(user,link, fileType = "audio",objectType = "User",$appender){
	userBox.sharingGetSharedLinkFile({url: link}).then(function(data) {
		if (fileType === "audio"){
			var endPoint = firebase.storage().ref(objectType+"s/" + user.key + "/music/" + data.name);
		}else if (fileType === "images"){
			var endPoint = firebase.storage().ref(objectType+"s/" + user.key + "/profile");
		}

		var barHolder = $("<div>").addClass("barHolder");
		var progressBar = $("<div>").addClass("progressBar");
		barHolder.append(progressBar);
		$appender.append(barHolder);
		
		var uploadTask = endPoint.put(data.fileBlob);
		// Register three observers:
		// 1. 'state_changed' observer, called any time the state changes
		// 2. Error observer, called on failure
		// 3. Completion observer, called on successful completion
		uploadTask.on('state_changed', function(snapshot){
		  // Observe state change events such as progress, pause, and resume
		  // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
		  var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
		  progressBar.css("width",progress+"%");
		}, function(error) {
			// Handle unsuccessful uploads
		}, function() {
			// Handle successful uploads on complete
			var downloadURL = uploadTask.snapshot.downloadURL;
			//store that shit
			if (fileType === "audio"){
				user.audioURLs.push(downloadURL);
				if (objectType === "User"){
					printAudio(user,user.audioURLs.length-1,true);
				} else if(objectType === "Project"){
					printAudio(user,user.audioURLs.length-1,true,$("#audio"+user.key));
				}
				
			} else if (fileType === "images"){
				user.imageURL = downloadURL;
				//cropped image edit
				$("#img"+user.key).attr("src",user.imageURL).attr("style", "background-image: url('"+user.imageURL+"');").addClass("crop");
			}
			if (objectType === "User"){
				usersEndPoint.child(user.key).update(user);
			} else if (objectType === "Project"){
				projectsEndPoint.child(user.key).update(user);
			}
			barHolder.remove();
		});


    }).catch(function(error) {
  		console.error(error);
    });
}

$("#userDropbox").on('click',function(event){
	event.preventDefault();
	var dbx = new Dropbox({ clientId: myDbxId });
	var myURL = dbx.getAuthenticationUrl("https://eric-hoppenworth.github.io/codeRed/account.html");
	window.location = myURL;
});

function isAuthenticated() {
	return !!getAccessTokenFromUrl();
}

function getAccessTokenFromUrl() {
	return utils.parseQueryString(window.location.hash).access_token;
}

//this function allows me to split up the url
(function(window){
  window.utils = {
    parseQueryString: function(str) {
      var ret = Object.create(null);

      if (typeof str !== 'string') {
        return ret;
      }

      str = str.trim().replace(/^(\?|#|&)/, '');

      if (!str) {
        return ret;
      }

      str.split('&').forEach(function (param) {
        var parts = param.replace(/\+/g, ' ').split('=');
        // Firefox (pre 40) decodes `%3D` to `=`
        // https://github.com/sindresorhus/query-string/pull/37
        var key = parts.shift();
        var val = parts.length > 0 ? parts.join('=') : undefined;

        key = decodeURIComponent(key);

        // missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
        val = val === undefined ? null : decodeURIComponent(val);

        if (ret[key] === undefined) {
          ret[key] = val;
        } else if (Array.isArray(ret[key])) {
          ret[key].push(val);
        } else {
          ret[key] = [ret[key], val];
        }
      });

      return ret;
    }
  };
})(window);
