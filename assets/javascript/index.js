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
		window.location = "account.html";
	} else {
		//no user is signed in
		//clear out options in navbar
		//unauthorized users will still be able to access the browse page by using te search bar
		$(".nav").eq(0).empty();
		var btnGoogle = $("<li><a id ='navGoogle'>Browse Projects</a></li>");
		$(".nav").eq(0).append(btnGoogle);
		$("#navGoogle").on("click",function(){
			var provider = new firebase.auth.GoogleAuthProvider();
			firebase.auth().signInWithRedirect(provider)
				.catch(function(error){
					console.log("google sign in error", error);
				});
		})
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


