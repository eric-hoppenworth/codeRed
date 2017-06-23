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


function User(name="default", email="",bio="User has not yet added a bio."){
	this.name = name;
	this.email = email;
	this.bio = bio;
	this.key = usersEndPoint.push().key;
	this.projectList = [];
	this.contributersList = [];
	this.dropBoxToken = "0";
	usersEndPoint.child(this.key).update(this);

}

function createUserObject() {
	var name = $("#userName").val().trim();
	var email = $("#userEmail").val().trim();
	var bio = $("#userBio").val().trim();

	var myUser = new User(name, email, bio);

}

function createProject() {
	var name = $("#projectName").val().trim();
	var email = $("#projectEmail").val().trim();
	var description = $("#projectDescription").val().trim();
	var needs = [];
	var wants = [];
	$(".inputNewNeed").each(function(index) {
		needs.push($(this).text());
	})
	$(".inputNewWant").each(function(index) {
		wants.push($(this).text());
	})
}

function addNeed() {
}


function Project(userKey,name ="default",email = "", desc = "Producer has not yet added a description.",needs,wants){
	this.name = name;
	this.email = email;
	this.description = desc;
	this.userKey = userKey;
	this.needs= needs;
	this.wants = wants;
	this.completedList = [];
}