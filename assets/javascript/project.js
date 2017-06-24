//retrieve projectID from address bar
var projectID = "-KnMvn4lKj-V7wyciCUl";

projectsEndPoint.once("value",function(snapshot) {
	var myProject = snapshot.child(projectID).val()
	printProject(myProject);
})

//this function will print the project info for the current project page
//argument is coming in as a Project Object
function printProject(project){

}
