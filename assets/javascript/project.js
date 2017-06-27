var currentPage = "project";
//retrieve projectID from address bar
var projectID = "-KnMvn4lKj-V7wyciCUl";
var myProject;
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
		});
	} else {
		//no user is signed in
	}
		
});
projectID = window.location.hash;
if (projectID=== ""){
	//there is no project to display
} else {
	//remove the "#"
	projectID = projectID.substring(1);
	projectsEndPoint.once("value",function(snapshot) {
		myProject = snapshot.child(projectID).val()
		printProject(myProject);
	})
}


//this function will print the project info for the current project page
//argument is coming in as a Project Object
function printProject(project){
	$("#projectImage").attr("src", project.imageURL);
	$("#projectName").text(project.name);
	$("#projectEmail").text(project.email);
	$("#projectDescription").text(project.description);
	$("#projectNeedsHolder").text("");
	$("#projectWantsHolder").text("");
	if (typeof project.needs === "string"){
		if(project.needs != "" && project.needs != undefined){
			$("#projectNeedsHolder").append("<li>" + project.needs + "</li>");
		}
	} else if (typeof project.needs === "object") {
		for (var i = 0; i < project.needs.length; i++) {
			if(project.needs[i] != "" && project.needs[i] != undefined){
				$("#projectNeedsHolder").append("<li>" + project.needs[i] + "</li>");
			}
		}
	}
	if (typeof project.wants === "string"){
		if(project.wants != "" && project.wants != undefined){
			$("#projectWantsHolder").append("<li>" + project.wants + "</li>");
		}
	} else if (typeof project.wants === "object") {
		for (var i = 0; i < project.wants.length; i++) {
			if(project.wants[i] != "" && project.wants[i] != undefined){
				$("#projectWantsHolder").append("<li>" + project.wants[i] + "</li>");
			}
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

