var myDbxId = "0ot1htkfrv9jzeg"
$("#btnDropBox").on('click',function(event){
	var dbx = new Dropbox({ clientId: myDbxId });
	var myURL = dbx.getAuthenticationUrl("https://eric-hoppenworth.github.io/codeRed/account.html");
	window.location.href = myURL;
	console.log(myURL);
});
//add the dropbox chooser button, only if drobBox is authenticated for this user
var myToken = "8qOYWXTfAnAAAAAAAAAAuTzpCfsqxz7PwySqCRDyyTFloL2vqgzX7phhwhNsb798"
var userBox = new Dropbox({accessToken: myToken});
var downloadLink;


var options = {
    // Required. Called when a user selects an item in the Chooser.
    success: function(files) {
        console.log(file.link)
    },
    cancel: function() {

    },
    linkType: "direct",
    // Optional. This is a list of file extensions.
    extensions: [],
};
var button = Dropbox.createChooseButton(options);
$("#addAudio").append(button);



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

//will make the project modal appear on page
//(this might already be built in to bootstrap, idk)
function showProjectModal(){

}

//add a need(along with a remove button) to the needs list on the modal, and add clear the need input
function addNeed(){

}

//remove a need from the needs list on the modal
function removeNeed(){

}

//add a want(along with a remove button) to the wants list on the modal, and add clear the need input
function addWant(){

}

//remove a want from the wants list on the modal
function removeWant(){

}

