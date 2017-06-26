var myDbxId = "0ot1htkfrv9jzeg"
$("#userDropbox").on('click',function(event){
	event.preventDefault();
	var dbx = new Dropbox({ clientId: myDbxId });
	var myURL = dbx.getAuthenticationUrl("https://eric-hoppenworth.github.io/codeRed/account.html");
	window.location = myURL;
});

firebase.auth().onAuthStateChanged(function(user){
	authUser = user;
	console.log('user',user);
	usersEndPoint.once("value",function(snapshot){
		if (snapshot.hasChild(user.uid)){
		//if the user already exists
			currentUser = snapshot.child(user.uid).val();
		} else {
			currentUser = new User();  //create a user using default values
		}
		//check to see if I just got sent here from dropbox auth
		printAccountInfo(currentUser);
		if(currentUser.dropBoxToken === "0"){
			if (isAuthenticated()){
				//already authenticated, show
				currentUser.dropBoxToken = getAccessTokenFromUrl();
				usersEndPoint.child(currentUser.key).update(currentUser)
				userBox = new Dropbox({accessToken: currentUser.dropBoxToken});
				var downloadLink;
				//audio dropbox button
				buildDropboxButton(currentUser, "audio", "User", $("#audioList"));
				//photo dropbox button
				buildDropboxButton(currentUser, "images", "User", $("#photoHolder"));
			}	
		}else{
			userBox = new Dropbox({accessToken: currentUser.dropBoxToken});
			var downloadLink;
			//audio dropbox button for user
			buildDropboxButton(currentUser, "audio", "User", $("#audioList"));
			//photo dropbox button
			buildDropboxButton(currentUser, "images", "User", $("#photoHolder"));
		}
	})
});

function buildDropboxButton(user,fileType, objectType, $appender){
	options = {
	    success: function(files) {
	    	downloadLink = files[0].link;
			storeInServer(user,downloadLink,fileType,objectType);
	    },
	    cancel: function() {},
	    linkType: "preview",
	    extensions: [fileType],
	};
	var button = Dropbox.createChooseButton(options);
	$appender.append(button);
}

function storeInServer(user,link, fileType = "audio",objectType = "User"){
	userBox.sharingGetSharedLinkFile({url: link}).then(function(data) {
		if (fileType === "audio"){
			var endPoint = firebase.storage().ref(objectType+"s/" + user.key + "/music/" + data.name);
		}else if (fileType === "images"){
			var endPoint = firebase.storage().ref(objectType+"s/" + user.key + "/profile");
		}
		
		endPoint.put(data.fileBlob).then(function(snapshot){
			var fileURL = endPoint.getDownloadURL().then(function(url){
				//store that shit
				if (fileType === "audio"){
					user.audioURLs.push(url);
					printAudio(user,user.audioURLs.length-1,true)
				} else if (fileType === "images"){
					user.imageURL = url;
				}
				if (objectType === "User"){
					usersEndPoint.child(user.key).update(user);
				} else if (objectType === "Project"){
					projectsEndPoint.child(user.key).update(user);
				}
				
			});
		});
    }).catch(function(error) {
  		console.error(error);
    });
}

//remove audio source from profile
$("body").on("click",".removeAudio",function(){
	var index = $(this).attr("data-index");
	currentUser.audioURLs[index] = "";
	usersEndPoint.child(currentUser.key).update(currentUser);
	$(this).parent().remove();
})

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

//creates a new project from the create project modal
function createProject() {
	var name = $("#newProjectTitle").val().trim();
	var email = $("#newProjectEmail").val().trim();
	var description = $("#newProjectInfo").val().trim();
	var needs = [];
	var wants = [];
	$(".inputNewNeed").each(function(index) {
		needs.push($(this).text());
	})
	$(".inputNewWant").each(function(index) {
		wants.push($(this).text());
	})

	var newProject = new Project(name,email,description,needs,wants)
}

$("#submitAccount").on("click",function(){
	updateUser(currentUser);
	$("#newName").val("");
	$("#newEmail").val("");
	$("#newBio").val("");
	$("#myAccountEdit").modal("hide");
})

//edits an existing project
//the project's key should be attached to its edit button.
function editProject(key){
	var name = $("#editProjectName").val().trim();
	var email = $("#editProjectEmail").val().trim();
	var description = $("#editProjectDescription").val().trim();
	var needs = [];
	var wants = [];
	$(".editNewNeed").each(function(index) {
		needs.push($(this).text());
	})
	$(".editNewWant").each(function(index) {
		wants.push($(this).text());
	})
	var key = $("editProject").att("data-key");
	var newProject = new Project(name,email,description,needs,wants,key);
}

function printAccountInfo(user){
	$("#userName").text(user.name);
	$("#userBio").text(user.bio);
	$("#userEmail").text(user.email);
	printAllAudio(user,true);
}

////////////////////////////////
////  Modals  //////////////////
////////////////////////////////

////  Project Modal ////////////
$("#needsAdd").on("click", function() {
	if ($("#newProjectNeeds").val().trim().length > 0 ) {
		addNeed();
	}
})

$("#wantsAdd").on("click", function() {
	if ($("#newProjectWants").val().trim().length > 0 ) {
		addWant();
	}
})


$("#submitProject").on("click", function() {
	createProject();
	$(".projectInput").val("");
	$(".inputNewNeed").parent().remove();
	$(".inputNewWant").parent().remove();
	$("#newProject").modal("hide");


})

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
})
