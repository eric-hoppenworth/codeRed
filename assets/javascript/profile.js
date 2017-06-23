usersEndPoint.once("value",function(snapshot) {
	var result = snapshot.child(userID).val()
	$("#userName").text(result.name);
	$("#userBio").text(result.bio);
})
