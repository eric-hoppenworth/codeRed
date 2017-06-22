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
$("#btnDropBox").on('click',function(event){
	var dbx = new Dropbox({ clientId: myDbxId });
	var myURL = dbx.getAuthenticationUrl(window.location.href);
	window.location.href = myURL;
	console.log(myURL);
});

$("#btnSignGoogle").on("click",function(event){
	var provider = new firebase.auth.GoogleAuthProvider();

	firebase.auth().signInWithRedirect(provider)
		.catch(function(error){
			console.log("google sign in error", error);
		});

});
var myUser;

firebase.auth().onAuthStateChanged(function(user){
	myUser = user;
	console.log('user',user);

	//this code will be used to retrieve user information on redirect
	var currentUrl = window.location.href;
	var newUrl = "";
	var userID = "#" + myUser.uid
	newUrl = currentUrl + "account" + userID;
	window.location.href = newUrl;
	console.log(newUrl);
});

function printProject(project){
	$("#divName").text(project.name)
}