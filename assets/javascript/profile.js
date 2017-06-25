//retrieve userID from address bar
var userID = "KYVOypHI6oQcJUrYuAc6zlW2ifm2"
var myUser;

usersEndPoint.once("value",function(snapshot) {
	myUser = snapshot.child(userID).val()
	printUser(myUser);
})

//function to print user data to the page on load
//argument passed in as User Object
function printUser(user){

}

//printProjectShort(key,false)
//This function will be living in the app.js file, since many pages will be using it

