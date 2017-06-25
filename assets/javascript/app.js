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
var authUser; //auth user is the user from firebase
var currentUser; //User Object from our code
var userBox;

firebase.auth().onAuthStateChanged(function(user){
	authUser = user;
	console.log('user',user);
	usersEndPoint.once("value",function(snapshot){
		if (snapshot.hasChild(user.uid)){
		//if the user already exists
			currentUser = snapshot.child(user.uid).val();
		} else {
			currentUser = new User();  //create a user using default values
		}
	})

	//this code will be used to retrieve user information on redirect
	// var currentUrl = window.location.href;
	// var newUrl = "";
	// var userID = "#" + authUser.uid
	// newUrl = currentUrl + "account" + userID;
	// window.location.href = newUrl;
	// console.log(newUrl);
});
function isAuthenticated() {
	return !!getAccessTokenFromUrl();
}

function getAccessTokenFromUrl() {
	return utils.parseQueryString(window.location.hash).access_token;
}

//this function allows me to split up the url
(function(window){
  window.utils = {
    parseQueryString: function(str) {
      var ret = Object.create(null);

      if (typeof str !== 'string') {
        return ret;
      }

      str = str.trim().replace(/^(\?|#|&)/, '');

      if (!str) {
        return ret;
      }

      str.split('&').forEach(function (param) {
        var parts = param.replace(/\+/g, ' ').split('=');
        // Firefox (pre 40) decodes `%3D` to `=`
        // https://github.com/sindresorhus/query-string/pull/37
        var key = parts.shift();
        var val = parts.length > 0 ? parts.join('=') : undefined;

        key = decodeURIComponent(key);

        // missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
        val = val === undefined ? null : decodeURIComponent(val);

        if (ret[key] === undefined) {
          ret[key] = val;
        } else if (Array.isArray(ret[key])) {
          ret[key].push(val);
        } else {
          ret[key] = [ret[key], val];
        }
      });

      return ret;
    }
  };
})(window);

function Project(name ="default",email = "", desc = "Producer has not yet added a description.",needs,wants,key =""){
	this.name = name;
	this.email = email;
	this.description = desc;
	this.genre = "Rap";
	this.userKey = authUser.uid;
	this.needs= needs;
	this.wants = wants;
	this.completedList = [];
	this.imgURL = "";
	if (key === ""){
		//this is a new project, generate a key
		this.key = projectsEndPoint.push().key;
	} else {
		//this project already exists
		this.key = key;
	}
	projectsEndPoint.child(this.key).update(this);
}

function User(name="default", email="",bio="User has not yet added a bio."){
	this.name = name;
	this.email = email;
	this.bio = bio;
	this.key = authUser.uid;
	this.projectList = [];
	this.contributersList = [];
	this.dropBoxToken = "0";
	this.audioURLs = [""];
	this.imageURL = "";
	usersEndPoint.child(this.key).update(this);
}

//prints a short description of the project to go on the User's account page
//On the account page, we will want to show buttons for 'edit' and 'delete'
//On profile and browse pages, we do not want to have buttons
//this should be in app.js
function printProjectShort(key,showButtons = false){ 
	projectsEndPoint.once("value",function(snapshot){
		var myProject = snapshot.child(key).val();
		var bigDiv = $("<div>");
		bigDiv.addClass("col-xs-6 projectSample");
		bigDiv.append($("<h2>").text(myProject.name));
		bigDiv.append($("<img src ='" + myProject.imgURL + "' alt = 'Project Image'>"))
		bigDiv.append($("<br>"));
		//attach the audio
		//not there yet
		var details = $("<details><summary> Genre: " + myProject.genre +"</summary><p>"+ myProject.desctiption +"</p></details>")
		bigDiv.append(details);
		//in progress....EH
	})
}

//will print audio samples retrieved from storage
//eric is building this one
function printAllAudio(user,showButtons = false){
	for(var i= 0; i < user.audioURLs.length; i++){
		if (user.audioURLs[i]=== undefined || user.audioURLs[i]=== ""){
			//do nothing
		}else {
			printAudio(user,i,showButtons);
		}
		
	}
}
function printAudio(user,index,showButtons = false){
	var audioDiv = $("<div>");
	audioDiv.addClass("audioHolder");
	var audio = $("<audio>");
	audio.attr("controls","");
	var source = $("<source>");
	source.attr("src", user.audioURLs[index]);
	source.attr("type","audio/mp4");
	audio.append(source);
	audioDiv.append(audio);
	if(showButtons){
		var button = $("<button>");
		button.addClass("removeAudio");
		button.text("remove");
		button.attr("data-index",index);
		audioDiv.append(button);
	}
	$("#audioList").append(audioDiv);
}
