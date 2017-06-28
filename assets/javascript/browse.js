var currentPage = "browse";
var searchTerm;
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
	//regardless of whether or not you are signed in, still do a search based on hash
	searchTerm = window.location.hash;
	if (searchTerm === "" || searchTerm === "#"){
		//no search term provided
		//do a search based on recent
	} else {
		//perform search
		//remove hash
		searchTerm = searchTerm.subString(1);
		executeSearch("need",searchTerm);
	}
});
