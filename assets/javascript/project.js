//retrieve projectID from address bar
var projectID = "-KnMvn4lKj-V7wyciCUl";

projectsEndPoint.once("value",function(snapshot) {
	var myProject = snapshot.child(projectID).val()
	printProject(myProject);
})

//this function will print the project info for the current project page
//argument is coming in as a Project Object
function printProject(project){
	//$("#projectImage").attr("src", project.imgUrl);
	$("#projectName").text(project.name);
	$("#projectEmail").text(project.email);
	$("#projectDescription").text(project.description);
	$(".projectNeedsHolder").text("");
	$(".projectWantsHolder").text("");
	for (var i = 0; i < project.needs.length; i++) {
		$(".projectNeedsHolder").append("<li>" + project.needs[i] + "</li>");
		$(".projectWantsHolder").append("<li>" + project.wants[i] + "</li>");
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

