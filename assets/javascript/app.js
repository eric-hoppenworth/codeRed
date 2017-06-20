var config = {
    apiKey: "AIzaSyAveFUvto0lPSpetwLo0xBXPjBUyv61MEU",
    authDomain: "codered-503c1.firebaseapp.com",
    databaseURL: "https://codered-503c1.firebaseio.com",
    projectId: "codered-503c1",
    storageBucket: "codered-503c1.appspot.com",
    messagingSenderId: "335324790916"
  };
  firebase.initializeApp(config);
  var myToken = "8qOYWXTfAnAAAAAAAAAAiyNkOj-gphzbilLE3kgY58iLaipxfXAwPpz3xJCc5x4O";
  var dbx = new Dropbox({ accessToken: myToken });
  dbx.filesListFolder({path: ''})
    .then(function(response) {
      console.log(response);
    })
    .catch(function(error) {
      console.log(error);
    });