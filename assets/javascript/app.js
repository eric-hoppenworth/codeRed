var config = {
    apiKey: "AIzaSyAveFUvto0lPSpetwLo0xBXPjBUyv61MEU",
    authDomain: "codered-503c1.firebaseapp.com",
    databaseURL: "https://codered-503c1.firebaseio.com",
    projectId: "codered-503c1",
    storageBucket: "codered-503c1.appspot.com",
    messagingSenderId: "335324790916"
  };
firebase.initializeApp(config);
// var myToken = "8qOYWXTfAnAAAAAAAAAAiyNkOj-gphzbilLE3kgY58iLaipxfXAwPpz3xJCc5x4O";
// var dbx = new Dropbox({ accessToken: myToken });
// dbx.filesListFolder({path: ''})
//   .then(function(response) {
//     console.log(response);
//   })
//   .catch(function(error) {
//     console.log(error);
//   });
$("#btnSignGoogle").on("click",function(event){
	var provider = new firebase.auth.GoogleAuthProvider();

	firebase.auth().signInWithRedirect(provider);

	firebase.auth().getRedirectResult().then(function(result) {
		if (result.credential) {
			// This gives you a Google Access Token. You can use it to access the Google API.
			var token = result.credential.accessToken;
			// ...
		}
		// The signed-in user info.
		var user = result.user;

		var currentUrl = window.location.href;
		var newUrl = "";
		newUrl = currentUrl + "/account";
		window.location.href = newUrl;

	}).catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		// The email of the user's account used.
		var email = error.email;
		// The firebase.auth.AuthCredential type that was used.
		var credential = error.credential;
		// ...

		if (errorCode = "auth/operation-not-supported-in-this-environment"){
			var currentUrl = window.location.href;
			var newUrl = "";
			var subIndex = 0;
			for (var i = currentUrl.length; i > 0; i--){
				if (currentUrl[i] === "/"){
					subIndex = i;
					break;
				}
			}
			newUrl = currentUrl.substring(0,subIndex) + "/account.html";
			window.location.href = newUrl;
		}
		
	});

	

	

});
$("#btnCheck").on("click",function(event){
	console.log(firebase.auth());
})