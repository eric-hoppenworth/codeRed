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
var currentUrl = window.location.href;
var database = firebase.database().ref();
var dbUsers = database.child("Users");

var subIndex = 0;
for (var i = currentUrl.length; i > 0; i--){
	if (currentUrl[i] === "#"){
		subIndex = i;
		break;
	}
}
userID = currentUrl.substring(subIndex+1,currentUrl.length);
console.log(userID)

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

}
