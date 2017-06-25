var myDbxId = "0ot1htkfrv9jzeg"
$("#userDropbox").on('click',function(event){
	event.preventDefault();
	var dbx = new Dropbox({ clientId: myDbxId });
	var myURL = dbx.getAuthenticationUrl("https://eric-hoppenworth.github.io/codeRed/account.html");
	
});
var myToken;
//add the dropbox chooser button, only if drobBox is authenticated for this user
firebase.auth().onAuthStateChanged(function(user){
	usersEndPoint.once("value",function	(snapshot){
		myToken = snapshot.child(user.uid).val().dropBoxToken;
	})
	if(myToken === "0"){
		//I do not have a token, do not show db button
	} else {
		var userBox = new Dropbox({accessToken: myToken});
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

if (isAuthenticated()){
	//already authenticated, show
	myToken = getAccessTokenFromUrl();
	//usersEndPoint.child(currentUser.key).update(currentUser)
	//window.location ="https://eric-hoppenworth.github.io/codeRed/account.html";
}

function storeInServer(user,link){
	userBox.sharingGetSharedLinkFile({url: link}).then(function(data) {
		var endPoint = firebase.ref(authUser.uid + "/music/" + data.name);
		endPoint.put(data.fileBlob);

    }).catch(function(error) {
  		console.error(error);
    });
}

function getAccessTokenFromUrl() {
	return utils.parseQueryString(window.location.hash).access_token;
}
function isAuthenticated() {
	return !!getAccessTokenFromUrl();
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
	if ($("#newProjectNeeds").val().trim().length > 0 ) {
		addNeed();
	}
})

$("#wantsAdd").on("click", function() {
	if ($("#newProjectWants").val().trim().length > 0 ) {
		addWant();
	}
})

$("#modalSave").on("click", function() {
	storeNewProject()
	storeNeeds();
	storeWants();
})

//add a need(along with a remove button) to the needs list on the modal, and add clear the need input
function addNeed(){
	var userNeed = $("#newProjectNeeds").val().trim();
	var needDiv = $("<div>").addClass("needHolder");

	$("#needList").append(needDiv).append("<li class='inputNewNeed'>" + userNeed + " <button class='removeMe'>Remove</button></li>");

	$("#newProjectNeeds").val("");
}

//enables the reomve button on each need/want to remove selected list item on create project modal
$("body").on("click", ".removeMe", function() {
	$(this).parent().remove();
})

//stores the new project information
function storeNewProject() {
	var title = $("#newProjectTitle").val().trim();
	var info = $("#newProjectInfo").val().trim();
	var email = $("#newProjectEmail").val().trim();
}
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


