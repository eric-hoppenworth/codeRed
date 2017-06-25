//retrieve projectID from address bar
var projectID = "-KnMvn4lKj-V7wyciCUl";

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
	})

	//this code will be used to retrieve user information on redirect
	projectID = window.location.hash;
	if (projectID=== ""){
		//there is no project to display
	} else {
		//remove the "#"
		projectID = projectID.substring(1);
		projectsEndPoint.once("value",function(snapshot) {
			var myProject = snapshot.child(projectID).val()
			printProject(myProject);
		})
	}

	// var currentUrl = window.location.href;
	// var newUrl = "";
	// var userID = "#" + authUser.uid
	// newUrl = currentUrl + "account" + userID;
	// window.location.href = newUrl;
	// console.log(newUrl);
});



//this function will print the project info for the current project page
//argument is coming in as a Project Object
function printProject(project){
	$("#projectImage").attr("src", project.imgURL);
	$("#projectName").text(project.name);
	$("#projectEmail").text(project.email);
	$("#projectDescription").text(project.description);
	$(".projectNeedsHolder").text("");
	$(".projectWantsHolder").text("");
	if (typeof project.needs === "string"){
		$(".projectNeedsHolder").append("<li>" + project.needs[i] + "</li>");
	} else if (typeof project.needs === "object") {
		for (var i = 0; i < project.needs.length; i++) {
			$(".projectNeedsHolder").append("<li>" + project.needs[i] + "</li>");
		}
	}
	if (typeof project.wants === "string"){
		$(".projectWantsHolder").append("<li>" + project.wants[i] + "</li>");
	} else if (typeof project.wants === "object") {
		for (var i = 0; i < project.wants.length; i++) {
			$(".projectWantsHolder").append("<li>" + project.wants[i] + "</li>");
		}
	}
}

//this function will print the user info for the current signed in user
//argument is coming in as a User Object
function printUser(user){
	var userDiv = $("<div>");
	var userName = $("<h2>").text(user.name);
	var userEmail = $("<h3>").text(user.email);
	var userBio = $("<p>").text(user.bio);

	userDiv.append(userName, userEmail, userBio).appendTo("#userProfile");
};

