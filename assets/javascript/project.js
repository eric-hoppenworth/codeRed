var currentPage = "project";
//retrieve projectID from address bar
var projectID = window.location.hash;
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
			if (projectID === ""){
				//there is no project to display
				window.location = "index.html";
			} else {
				//remove the "#"
				projectID = projectID.substring(1);
				projectsEndPoint.once("value",function(snapshot) {
					if (snapshot.hasChild(projectID)){
						myProject = snapshot.child(projectID).val();
						printProject(myProject);	
					} else {
						//invalid hash
						window.location = "index.html";
					}
				})
			}
		});
	} else {
		//no user is signed in
		if (projectID === ""){
			//there is no project to display
			window.location = "index.html";
		} else {
			//remove the "#"
			projectID = projectID.substring(1);
			projectsEndPoint.once("value",function(snapshot) {
				if (snapshot.hasChild(projectID)){
					myProject = snapshot.child(projectID).val();
					printProject(myProject);	
				} else {
					//invalid hash
					window.location = "index.html";
				}
			})
		}
	}
		
});



//this function will print the project info for the current project page
//argument is coming in as a Project Object
function printProject(project){
	$("#projectImage").attr("style", "background-image: url('"+project.imageURL+"');").addClass("crop");
	$("#projectName").text(project.name);
	$("#projectEmail").text(project.email);
	$("#projectDescription").text(project.description);
	$("#projectGenre").text(project.genre);
	$("#projectNeedsHolder").text("");
	$("#projectWantsHolder").text("");

	printAllAudio(project);

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
