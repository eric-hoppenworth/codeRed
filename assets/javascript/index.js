var currentPage = "index";
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
//functions to control sign-in flow

$("#btnSignGoogle").on("click",function(event){
	var provider = new firebase.auth.GoogleAuthProvider();

	firebase.auth().signInWithRedirect(provider)
		.catch(function(error){
			console.log("google sign in error", error);
		});

});