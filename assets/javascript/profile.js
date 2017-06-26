//retrieve userID from address bar
var profileID = "KYVOypHI6oQcJUrYuAc6zlW2ifm2"
var profileUser;

profileID = window.location.hash;
if (profileID=== ""){
	//there is no project to display
} else {
	//remove the "#"
	profileID = profileID.substring(1);
	usersEndPoint.once("value",function(snapshot) {
		var profileUser = snapshot.child(profileID).val()
		printProfile(profileUser);
	})
}

//function to print user data to the page on load
//argument passed in as User Object
function printProfile(user){
	$("#userName").text(user.name);
	$("#userImage").text(user.pic);
	$("#userInfo").text(user.bio);
}

//printProjectShort(key,false)
//This function will be living in the app.js file, since many pages will be using it

