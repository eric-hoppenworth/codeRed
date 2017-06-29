var currentPage = "browse";
var searchTerm;
var searchResults = [];
firebase.auth().onAuthStateChanged(function(user){
	if (user){
		authUser = user;
		usersEndPoint.once("value",function(snapshot){
			if (snapshot.hasChild(user.uid)){
			//if the user already exists
				currentUser = snapshot.child(user.uid).val();
			} else {
				currentUser = new User();  //create a user using default values
			}
		});
	} else {
		//no user is signed in
	}
	//regardless of whether or not you are signed in, still do a search based on hash
	searchTerm = window.location.hash;
	if (searchTerm === "" || searchTerm === "#"){
		//no search term provided
		//do a search based on recent
	} else {
		//perform search
		//remove hash
		searchTerm = searchTerm.substring(1);
		executeSearch("need",searchTerm);
	}
});

//search through the data base for a project with the provided searchTerm
//at first, it will only search by need, but I can allow other queries as well.
$("#submitSearchBrowse").on("click",function(event){
	event.preventDefault();
	var searchTerm = $("#inputSearch").val().trim();
	executeSearch("need",searchTerm);
});

function executeSearch(type= "need",searchTerm){
	var index = 0;
	searchResults = [];
	projectsEndPoint.orderByChild("name").once("value",function(snapshot){
		snapshot.forEach(function(dataProject){
			var myProject = dataProject.val();
			//check to see if the project has a 'need'
			if (typeof myProject.needs === "string"){
				if (myProject.needs.toLowerCase() === searchTerm.toLowerCase()){
					//print project images to carousel
					searchResults.push(myProject);
					//console.log(index + ": "+myProject.key);
					//index ++;
				}
			} else {
				for (var i = 0; i < myProject.needs.length; i++){
					if (myProject.needs[i].toLowerCase() === searchTerm.toLowerCase()){
						//print project images to carousel
						searchResults.push(myProject);
						//console.log(index + ": "+myProject.key);
						//index ++;
						break;
					}
				}
			}
		});
		showResults(searchResults);
	});
}

//an array of projects
function showResults(resultArray){
	//add image to carousel
	var appender = $("#preview-coverflow");
	appender.empty();

	if (resultArray.length === 0){
		//there are no results to show
		var holder = $("<div>").addClass("cover");
		holder.append($("<p>").text("No Results Were Found"));
		holder.append($("<p>").text("Try a seach for similar terms"));
		hodler.append($("<p>").text("i.e. 'vocals' or 'vocalist'"));
	} else{
		for (var i = 0; i < resultArray.length;i++){
			var holder = $("<div>").addClass("cover").attr("data-key",resultArray[i].key);
			var image = $("<img>").attr("src",resultArray[i].imageURL);
			var paraName = $("<p>").addClass("coverName").text(resultArray[i].name);
			var paraGenre = $("<p>").addClass("coverGenre").text(resultArray[i].genre);
			holder.append(image).append(paraName).append(paraGenre);
			appender.append(holder);
		}
	}

	
	$("#preview-coverflow").coverflow("refresh");
}

$("#preview-coverflow").on("click",".cover",function(event){
	$("#projectSampleHolder").empty();
	printProjectSnippet($(this).attr("data-key"));
});