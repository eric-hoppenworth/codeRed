var config = {
    apiKey: "AIzaSyAveFUvto0lPSpetwLo0xBXPjBUyv61MEU",
    authDomain: "codered-503c1.firebaseapp.com",
    databaseURL: "https://codered-503c1.firebaseio.com",
    projectId: "codered-503c1",
    storageBucket: "codered-503c1.appspot.com",
    messagingSenderId: "335324790916"
  };
firebase.initializeApp(config);
var usersEndPoint = firebase.database().ref().child("Users");
var projectsEndPoint = firebase.database().ref().child("Projects");
var authUser;
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

	firebase.auth().signInWithRedirect(provider)
		.catch(function(error){
			console.log("google sign in error", error);
		});

});


firebase.auth().onAuthStateChanged(function(user){
	authUser = user;
	console.log('user',user);

	//this code will be used to retrieve user information on redirect
	// var currentUrl = window.location.href;
	// var newUrl = "";
	// var userID = "#" + authUser.uid
	// newUrl = currentUrl + "account" + userID;
	// window.location.href = newUrl;
	// console.log(newUrl);
});

function Project(name ="default",email = "", desc = "Producer has not yet added a description.",needs,wants,key =""){
	this.name = name;
	this.email = email;
	this.description = desc;
	this.userKey = authUser.uid;
	this.needs= needs;
	this.wants = wants;
	this.completedList = [];
	if (key = ""){
		//this is a new project, generate a key
		this.key = projectsEndPoint.push().key;
	} else {
		//this project already exists
		this.key = key;
	}
	projectsEndPoint.child(this.key).update(this)
}

function User(name="default", email="",bio="User has not yet added a bio."){
	this.name = name;
	this.email = email;
	this.bio = bio;
	this.key = authUser.uid;
	this.projectList = [];
	this.contributersList = [];
	this.dropBoxToken = "0";
	usersEndPoint.child(this.key).update(this);
}
