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

//will print audio samples retrieved from storage
//eric is building this one
function printAudio(user){
	for(var i= 0; i < user.audioURLs.length; i++){
		if (user.audioURLs[i]=== null || user.audioURLs[i]=== ""){
			//do nothing
		}else {
			var audio = $("<audio>");
			audio.attr("controls","");
			var source = $("<source>");
			source.attr("src", user.audioURLs[i])
			source.attr("type","audio/mp4");
			audio.append(source);
			$("#audioHolder").append(audio);
		}
		
	}
}

