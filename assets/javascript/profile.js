//retrieve userID from address bar
var userID = "x18M5K7AvZh1dBlkfIJ6GwFOsoH3"
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


//will print audio samples retrieved from storage
//eric is building this one
function printAudio(user){
	for(var i= 0; i < myUser.audioURLs.length; i++)
		var audio = $("<audio>")
		audio.attr("controls","");
		var source = $("<source>");
		source.attr("src", myUser.audioURLs[i])
		source.attr("type","audio/mp4");
		audio.append(source);
		$("#audioHolder").append(audio);
	}
}

