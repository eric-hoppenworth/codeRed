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
		if(currentUser.dropBoxToken === "0"){
			if (isAuthenticated()){
				//already authenticated, show
				currentUser.dropBoxToken = getAccessTokenFromUrl();
				usersEndPoint.child(currentUser.key).update(currentUser)
				//window.location ="https://eric-hoppenworth.github.io/codeRed/account.html";
				userBox = new Dropbox({accessToken: currentUser.dropBoxToken});
				var downloadLink;

				var options = {
				    // Required. Called when a user selects an item in the Chooser.
				    success: function(files) {
				    	downloadLink = files[0].link;
						storeInServer(authUser,downloadLink);
					
				    },
				    cancel: function() {

				    },
				    linkType: "preview",
				    // Optional. This is a list of file extensions.
				    extensions: ["audio"],
				};
				var button = Dropbox.createChooseButton(options);
				$("#addAudio").append(button);
			}	
		}else{
			userBox = new Dropbox({accessToken: currentUser.dropBoxToken});
			var downloadLink;

			var options = {
			    // Required. Called when a user selects an item in the Chooser.
			    success: function(files) {
			    	downloadLink = files[0].link;
					storeInServer(authUser,downloadLink);
				
			    },
			    cancel: function() {

			    },
			    linkType: "preview",
			    // Optional. This is a list of file extensions.
			    extensions: ["audio"],
			};
			var button = Dropbox.createChooseButton(options);
			$("#addAudio").append(button);
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


function storeInServer(user,link){
	userBox.sharingGetSharedLinkFile({url: link}).then(function(data) {
		var endPoint = firebase.storage().ref("Users/" + authUser.uid + "/music/" + data.name);
		endPoint.put(data.fileBlob).then(function(snapshot){
			var fileURL = endPoint.getDownloadURL().then(function(url){
				//store that shit
				currentUser.audioURLs.push(url);
				usersEndPoint.child(currentUser.key).update();
			});
		});

		

    }).catch(function(error) {
  		console.error(error);
    });
}


//users are created on login with default values
function updateUser() {
	var name = $("#userName").val().trim();
	var email = $("#userEmail").val().trim();
	var bio = $("#userBio").val().trim();

	var myUser = new User(name, email, bio);
}

//creates a new project from the create project modal
function createProject() {
	var name = $("#projectName").val().trim();
	var email = $("#projectEmail").val().trim();
	var description = $("#projectDescription").val().trim();
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

$("#submitUserEdit").on("click",function(){
	updateUser();
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

$("#modalSave").on("click", function() {
	storeNeeds();
})

$("#modalSave").on("click", function() {
	storeWants();
})

//add a need(along with a remove button) to the needs list on the modal, and add clear the need input
function addNeed(){
	var userNeed = $("#newProjectNeeds").val().trim();
	var needDiv = $("<div>").addClass("needHolder");

	$("#needList").append(needDiv).append("<li class='inputNewNeed'>" + userNeed + " <button class='removeMe'>Remove</button></li>");

	$("#newProjectNeeds").val("");
}

//remove a need from the needs list on the modal
/*function removeNeed(){
	$(".removeMe").parent().remove();
}*/

//enables the reomve button on each need/want to remove selected list item on create project modal
$("body").on("click", ".removeMe", function() {
	$(this).parent().remove();
})
//stores the needs from the create project modal into the "needs" array
var needs = [];
function storeNeeds() {
	$(".inputNewNeed").each(function(){
		needs.push($(this).text());
	})
}

//add a want(along with a remove button) to the wants list on the modal, and add clear the need input
function addWant(){
	var userWant = $("#newProjectWants").val().trim();
	var wantDiv = $("<div>").addClass("wantHolder");

	$("#wantList").append(wantDiv).append("<li class='inputNewWant'>" + userWant + " <button class='removeMe'>Remove</button></li>");

	$("#newProjectWants").val("");
}

//stores the wants from the create project modal into the "wants" array
var wants = [];
function storeWants() {
	$(".inputNewWant").each(function(){
		wants.push($(this).text());
	})
}

//remove a want from the wants list on the modal
/*function removeWant(){

}*/

