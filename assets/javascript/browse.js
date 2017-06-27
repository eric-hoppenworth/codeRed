var currentPage = "browse";
var searchTerm;
searchTerm = "guitar";
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

//search through the data base for a project with the provided searchTerm
//at first, it will only search by need, but I can allow other queries as well.
$("#submitSearch").on("click",function(event){
	event.preventDefault();
	var index = 0;
	projectsEndPoint.once("value",function(snapshot){
		snapshot.forEach(function(dataProject){
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
});
