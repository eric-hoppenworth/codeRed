var searchTerm;
searchTerm = "guitar";


//search through the data base for a project with the provided searchTerm
//at first, it will only search by need, but I can allow other queries as well.
$("#submitSearch").on("click",function(event){
	event.preventDefault();
	var index = 0;
	projectsEndPoint.once("child_added",function(dataProject){
		var myProject = dataProject.val();
		//check to see if the project has a 'need'
		if (typeof myProject.needs === "string"){
			if (myProject.needs.toLowerCase() === searchTerm.toLowerCase()){
				console.log(index + ": "+myProject.key);
				index ++;
			}
		} else {
			for (var i = 0; i < myProject.needs.length; i++){
				if (myProject.needs[i].toLowerCase() === searchTerm.toLowerCase()){
					console.log(index + ": "+myProject.key);
					index ++;
					break;
				}
			}
		}
	});
});
