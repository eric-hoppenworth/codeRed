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
				var options = {
				    // Required. Called when a user selects an item in the Chooser.
				    success: function(files) {
				    	downloadLink = files[0].link;
						storeInServer(authUser,downloadLink,"audio");
					
				    },
				    cancel: function() {

				    },
				    linkType: "preview",
				    // Optional. This is a list of file extensions.
				    extensions: ["audio"],
				};
				var button = Dropbox.createChooseButton(options);
				$("#audioList").prepend(button);

				options = {
				    // Required. Called when a user selects an item in the Chooser.
				    success: function(files) {
				    	downloadLink = files[0].link;
						storeInServer(authUser,downloadLink,"image");
					
				    },
				    cancel: function() {

				    },
				    linkType: "preview",
				    // Optional. This is a list of file extensions.
				    extensions: ["images"],
				};
				var button = Dropbox.createChooseButton(options);
				$("#photoHolder").append(button);
			}	
		}else{
			userBox = new Dropbox({accessToken: currentUser.dropBoxToken});
			var downloadLink;
			var options = {
			    // Required. Called when a user selects an item in the Chooser.
			    success: function(files) {
			    	downloadLink = files[0].link;
					storeInServer(authUser,downloadLink,"audio");
				
			    },
			    cancel: function() {

			    },
			    linkType: "preview",
			    // Optional. This is a list of file extensions.
			    extensions: ["audio"],
			};
			var button = Dropbox.createChooseButton(options);
			$("#audioList").prepend(button);
			options = {
			    // Required. Called when a user selects an item in the Chooser.
			    success: function(files) {
			    	downloadLink = files[0].link;
					storeInServer(authUser,downloadLink,"image");
				
			    },
			    cancel: function() {

			    },
			    linkType: "preview",
			    // Optional. This is a list of file extensions.
			    extensions: ["images"],
			};
			var button = Dropbox.createChooseButton(options);
			$("#photoHolder").append(button);
		}
	})

	//this code will be used to retrieve user information on redirect
	// var currentUrl = window.location.href;
	// var newUrl = "";
	// var userID = "#" + authUser.uid
	// newUrl = currentUrl + "account" + userID;
	// window.location.href = newUrl;
	// console.log(newUrl);
});


function storeInServer(user,link, type){
	userBox.sharingGetSharedLinkFile({url: link}).then(function(data) {
		if (type === "audio"){
			var endPoint = firebase.storage().ref("Users/" + authUser.uid + "/music/" + data.name);
		}else if (type === "image"){
			var endPoint = firebase.storage().ref("Users/" + authUser.uid + "/" + data.name);
		}
		
		endPoint.put(data.fileBlob).then(function(snapshot){
			var fileURL = endPoint.getDownloadURL().then(function(url){
				//store that shit
				if (type === "audio"){
					currentUser.audioURLs.push(url);
					printAudio(currentUser,currentUser.audioURLs.length-1,true)
				} else if (type === "image"){
					currentUser.imageURL = url;
				}
				usersEndPoint.child(currentUser.key).update(currentUser);
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
	var name = $("#newProjectName").val().trim();
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
	addNeed();
})

$("#wantsAdd").on("click", function() {
	addWant();
})

$("#submitProject").on("click", function() {
	createProject();
})

//add a need(along with a remove button) to the needs list on the modal, and add clear the need input
function addNeed(){
	var userNeed = $("#newProjectNeeds").val().trim();
	var needDiv = $("<div>").addClass("needHolder");

	$("#needList").append(needDiv).append("<li class='inputNewNeed'>" + userNeed + " <button class='removeMe'>Remove</button></li>");

	$("#newProjectNeeds").val("");
}

//add a want(along with a remove button) to the wants list on the modal, and add clear the need input
function addWant(){
	var userWant = $("#newProjectWants").val().trim();
	var wantDiv = $("<div>").addClass("wantHolder");

	$("#wantList").append(wantDiv).append("<li class='inputNewWant'>" + userWant + " <button class='removeMe'>Remove</button></li>");

	$("#newProjectWants").val("");
}

//enables the reomve button on each need/want to remove selected list item on create project modal
$("body").on("click", ".removeMe", function() {
	$(this).parent().remove();
})
