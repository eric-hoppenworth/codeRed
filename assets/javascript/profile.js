var currentPage = "profile";
//retrieve userID from address bar
var profileID = window.location.hash;
var profileUser;
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
			if (profileID === ""){
				//there is no profile to display
				profileID = currentUser.key;
				profileUser = currentUser;
				printProfile(profileUser);
			} else {
				//remove the "#"
				profileID = profileID.substring(1);
				usersEndPoint.once("value",function(snapshot) {
					if (snapshot.hasChild(profileID)){
						profileUser = snapshot.child(profileID).val();
						printProfile(profileUser);
					} else {
						//no profile to show
						//there is no profile to display
						profileID = currentUser.key;
						profileUser = currentUser;
						printProfile(profileUser);
					}
				});
			}
		});
		
	} else {
		//no user is signed in
		if (profileID === ""){
			//there is no profile to display
			window.location = "index.html";
		} else {
			//remove the "#"
			profileID = profileID.substring(1);
			usersEndPoint.once("value",function(snapshot) {
				if (snapshot.hasChild(profileID)){
					var profileUser = snapshot.child(profileID).val();
					printProfile(profileUser);
				} else {
					//no profile to show
					window.location = "index.html";
				}
			});
		}
	}
		
});

//function to print user data to the page on load
//argument passed in as User Object
function printProfile(user){
	$("#userName").text(user.name);
	$("#userImage").text(user.pic);
	$("#userInfo").text(user.bio);
	//print audio
	printAllAudio(profileUser);
	//print project snippets
	projectsEndPoint.on("child_added",function(snapshot){
		var myProject = snapshot.val();
		if(myProject.userKey === profileUser.key){
			printProjectSnippet(myProject.key,false);
		}
	});
}

