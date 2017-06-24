//retrieve userID from address bar
var userID = "-KnHJLV1YK9E-GPNDBK1"

usersEndPoint.once("value",function(snapshot) {
	var myUser = snapshot.child(userID).val()
	printUser(myUser);
})

//function to print user data to the page on load
//argument passed in as User Object
function printUser(user){

}

//printProjectShort(key,false)
//This function will be living in the app.js file, since many pages will be using it


//will print audio samples retrieved from storage

function printAudio(){

}

