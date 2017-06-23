var config = {
    apiKey: "AIzaSyAveFUvto0lPSpetwLo0xBXPjBUyv61MEU",
    authDomain: "codered-503c1.firebaseapp.com",
    databaseURL: "https://codered-503c1.firebaseio.com",
    projectId: "codered-503c1",
    storageBucket: "codered-503c1.appspot.com",
    messagingSenderId: "335324790916"
  };
firebase.initializeApp(config);
//get userID from addressbar
var userID = "";

if (userID === ""){
	userID = "testUser";
}
var usersEndPoint = firebase.database().ref().child("Users");
var projectsEndPoint = firebase.database().ref().child("Projects");
//get userID from address bar
// var currentUrl = window.location.href;
// var database = firebase.database().ref();
// var dbUsers = database.child("Users");

<<<<<<< HEAD
dbUsers.once("value",function(snapshot) {
	var result = snapshot.child(userID).val()
	$("#userName").text(result.name);
	$("#userBio").text(result.bio);
})

function createUserObject() {
	var name = $("#userName").val().trim();
	var email = $("#userEmail").val().trim();
	var bio = $("#userBio").val().trim();

	var myUser = new User(name, email, bio);
=======
// var subIndex = 0;
// for (var i = currentUrl.length; i > 0; i--){
// 	if (currentUrl[i] === "#"){
// 		subIndex = i;
// 		break;
// 	}
// }
// userID = currentUrl.substring(subIndex+1,currentUrl.length);
// console.log(userID)

// dbUsers.once("value",function(snapshot) {
// 	var result = snapshot.child(userID).val()
// 	$("#userName").text(result.name);
// 	$("#userBio").text(result.bio);
// })


function User(name="", email="",bio=""){
	this.name = name;
	this.email = email;
	this.bio = bio;
	this.key = usersEndPoint.push().key;
	this.projectList = [];
	this.contributersList = [];
	this.dropBoxToken = "0";
	usersEndPoint.child(this.key).update(this);
>>>>>>> 0b859830bd143981470d3524e7b0680ec6392c5b

}
