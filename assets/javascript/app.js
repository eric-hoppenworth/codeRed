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
var myDbxId = "0ot1htkfrv9jzeg"
"0ot1\u2026rv9jzeg"
$("#btnDropBox").on('click',function(event){
	var dbx = new Dropbox({ clientId: myDbxId });
	var myURL = dbx.getAuthenticationUrl("https://codered-503c1.firebaseapp.com/__/auth/handler");
	window.location.href = myURL;
	console.log(myURL);
});

$("#btnSignGoogle").on("click",function(event){
	var provider = new firebase.auth.GoogleAuthProvider();

	firebase.auth().signInWithRedirect(provider)
		.catch(function(error){
			console.log("google sign in error", error);
		});

	// firebase.auth().getRedirectResult().then(function(result) {
	// 	if (result.credential) {
	// 		// This gives you a Google Access Token. You can use it to access the Google API.
	// 		var token = result.credential.accessToken;
	// 		// ...
	// 	}
	// 	// The signed-in user info.
	// 	var user = result.user;

	// }).catch(function(error) {
	// 	// Handle Errors here.
	// 	var errorCode = error.code;
	// 	var errorMessage = error.message;
	// 	// The email of the user's account used.
	// 	var email = error.email;
	// 	// The firebase.auth.AuthCredential type that was used.
	// 	var credential = error.credential;
	// 	// ...

	// 	if (errorCode = "auth/operation-not-supported-in-this-environment"){
	// 		var currentUrl = window.location.href;
	// 		var newUrl = "";
	// 		var subIndex = 0;
	// 		var userID = "#eric"
	// 		for (var i = currentUrl.length; i > 0; i--){
	// 			if (currentUrl[i] === "/"){
	// 				subIndex = i;
	// 				break;
	// 			}
	// 		}
	// 		newUrl = currentUrl.substring(0,subIndex) + "/account.html" + userID;
	// 		window.location.href = newUrl;
	// 	}
		
	// });

});
var myUser;

firebase.auth().onAuthStateChanged(function(user){
	myUser = user;
	console.log('user',user);
	var currentUrl = window.location.href;
	var newUrl = "";
	var userID = myUser.uid
	newUrl = currentUrl + "account" + userID;
	//window.location.href = newUrl;
	console.log(newUrl);
});