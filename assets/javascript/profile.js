var currentPage = "profile";
//retrieve userID from address bar
var profileID = "KYVOypHI6oQcJUrYuAc6zlW2ifm2"
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
		});
	} else {
		//no user is signed in
	}
		
});

profileID = window.location.hash;
if (profileID=== ""){
	//there is no project to display
} else {
	//remove the "#"
	profileID = profileID.substring(1);
	usersEndPoint.once("value",function(snapshot) {
		var profileUser = snapshot.child(profileID).val()
		printProfile(profileUser);
	})
}

//function to print user data to the page on load
//argument passed in as User Object
function printProfile(user){
	$("#userName").text(user.name);
	$("#userImage").text(user.pic);
	$("#userInfo").text(user.bio);
}

//printProjectShort(key,false)
//This function will be living in the app.js file, since many pages will be using it

