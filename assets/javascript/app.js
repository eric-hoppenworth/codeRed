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


function Project(name ="default",email = "", desc = "Producer has not yet added a description.",genre = "none",needs= [""],wants = [""],key =""){
	this.name = name;
	this.email = email;
	this.description = desc;
	this.genre = genre;
	this.userKey = authUser.uid;
	this.needs= needs;
	this.wants = wants;
	this.completedList = [""];
	this.imageURL = "assets/images/defaultProject.png";
	this.audioURLs = [""];
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
	this.projectList = [""];
	this.contributersList = [""];
	this.dropBoxToken = "0";
	this.audioURLs = [""];
	this.imageURL = "assets/images/defaultUser.png";
	usersEndPoint.child(this.key).update(this);
}

//prints a short description of the project to go on the User's account page
//On the account page, we will want to show buttons for 'edit' and 'delete'
//On profile and browse pages, we do not want to have buttons
//this should be in app.js
function printProjectSnippet(key,showButtons = false){ 
	projectsEndPoint.once("value",function(snapshot){
		var myProject = snapshot.child(key).val();
		var bigCol = $("<div>");
		//projects will be wider if they have edit buttons attached
		if (showButtons){
			bigCol.addClass("col-xs-12");
		} else {
			bigCol.addClass("col-xs-6");
		}
		var bigRow = $("<div>");
		bigRow.addClass("row projectSample");
		var leftDiv = $("<div>");
		if (showButtons){
			leftDiv.addClass("col-xs-3");
		} else{
			leftDiv.addClass("col-xs-6");
		}
		leftDiv.append($("<a href='project.html#"+ myProject.key +"'><h2>"+ myProject.name +"</h2></a>"))
		leftDiv.append($("<p>").text(myProject.description));
		leftDiv.append($("<p>").text("Contact: "+myProject.email));
		leftDiv.append($("<p>").text("Genre: "+myProject.genre));
		bigRow.append(leftDiv);
		//needs and wants div
		var rightDiv = $("<div>");
		if (showButtons){
			rightDiv.addClass("col-xs-3");
		} else{
			rightDiv.addClass("col-xs-6");
		}
		var needList = $("<ul><h3>Needs:</h3></ul>");
		if(typeof myProject.needs === "string"){
			needList.append($("<li>").text(myProject.needs));
		} else{
			for(var i = 0; i<myProject.needs.length;i++){
				if (myProject.needs[i] != undefined && myProject.needs[i] != ""){
					needList.append($("<li>").text(myProject.needs[i]));
				}
			}
		}
		rightDiv.append(needList);
		var wantList = $("<ul><h3>Wants:</h3></ul>");
		if(typeof myProject.wants === "string"){
			wantList.append($("<li>").text(myProject.wants));
		} else{
			for(var i = 0; i<myProject.wants.length;i++){
				if (myProject.wants[i] != undefined && myProject.wants[i] != ""){
					wantList.append($("<li>").text(myProject.wants[i]));
				}
			}
		}
		rightDiv.append(wantList);
		bigRow.append(rightDiv);
		//button div
		if(showButtons){
			var buttonDiv = $("<div>");
			buttonDiv.addClass("col-xs-6");
			//images
			var imgRow = $("<div>").addClass("row");
			var imgDbDiv = $("<div>").addClass("col-xs-6").append($("<p>").text("Upload an Image"));
			imgRow.append(imgDbDiv);
			buildDropboxButton(myProject,"images","Project",imgDbDiv);
			imgRow.append($("<div>").addClass("col-xs-6").append($("<img>").addClass("projectImage").attr("src",myProject.imageURL).attr("id","img"+myProject.key)));
			buttonDiv.append(imgRow);
			//audio
			var audioRow = $("<div>").addClass("row");
			var audioDbDiv = $("<div>").addClass("col-xs-6").append($("<p>").text("Upload a Sample"));
			audioRow.append(audioDbDiv);
			buildDropboxButton(myProject,"images","Project",audioDbDiv);
			var audioHolder = $("<div>").addClass("col-xs-6");
			audioRow.append(audioHolder);
			printAllAudio(myProject,true,audioHolder);
			buttonDiv.append(audioRow);
			//edit
			var editRow = $("<div>").addClass("row");
			editRow.append($("<button>").attr("type", "button").addClass("btn btn-primary").attr("data-toggle", "modal").attr("data-target", "#editProject").attr("data-key", key).text("Edit Details"));
			buttonDiv.append(editRow);

			bigRow.append(buttonDiv);
		}
		bigCol.append(bigRow);
		$("#projectSampleHolder").append(bigCol);
	});
}

//will print audio samples retrieved from storage
function printAllAudio(user,showButtons = false,appender = ""){
	for(var i= 0; i < user.audioURLs.length; i++){
		if (user.audioURLs[i]=== undefined || user.audioURLs[i]=== ""){
			//do nothing
		}else {
			printAudio(user,i,showButtons,appender);
		}
		
	}
}
function printAudio(user,index,showButtons = false,appender = ""){
	var audioDiv = $("<div>");
	audioDiv.addClass("audioHolder");
	var audio = $("<audio>");
	audio.attr("controls","")
	audio.attr('controlsList','nodownload');
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
	if (appender === ""){
		$("#audioList").append(audioDiv);
	} else {
		appender.append(audioDiv);
	}

}

//search through the data base for a project with the provided searchTerm
//at first, it will only search by need, but I can allow other queries as well.
$("#submitSearch").on("click",function(event){
	event.preventDefault();
	var searchTerm = $("#inputSearch").val().trim();
	executeSearch("need",searchTerm);
});

function executeSearch(type= "need",searchTerm){
	var index = 0;
	projectsEndPoint.once("value",function(snapshot){
		snapshot.forEach(function(dataProject){
			var myProject = dataProject.val();
			//check to see if the project has a 'need'
			if (typeof myProject.needs === "string"){
				if (myProject.needs.toLowerCase() === searchTerm.toLowerCase()){
					//print project images to carousel
					console.log(index + ": "+myProject.key);
					index ++;
				}
			} else {
				for (var i = 0; i < myProject.needs.length; i++){
					if (myProject.needs[i].toLowerCase() === searchTerm.toLowerCase()){
						//print project images to carousel
						console.log(index + ": "+myProject.key);
						index ++;
						break;
					}
				}
			}
		});
	});
}