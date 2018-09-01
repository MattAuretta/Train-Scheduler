 //Link Firebase 
 var config = {
     apiKey: "AIzaSyBiG2jjJlvUTc0TCKy9ZGzTx6PkRKoqjbk",
     authDomain: "train-scheduler-13025.firebaseapp.com",
     databaseURL: "https://train-scheduler-13025.firebaseio.com",
     projectId: "train-scheduler-13025",
     storageBucket: "train-scheduler-13025.appspot.com",
     messagingSenderId: "580393654561"
 };
 firebase.initializeApp(config);

 //Create variable for database
 var database = firebase.database();

 // FirebaseUI config.
 var uiConfig = {
     signInSuccessUrl: 'https://mattauretta.github.io/Train-Scheduler/',
     signInOptions: [
         // Leave the lines as is for the providers you want to offer your users.
         firebase.auth.GoogleAuthProvider.PROVIDER_ID,
     ],
     // tosUrl and privacyPolicyUrl accept either url string or a callback
     // function.
     // Terms of service url/callback.
     tosUrl: '<your-tos-url>',
     // Privacy policy url/callback.
     privacyPolicyUrl: function () {
         window.location.assign('<your-privacy-policy-url>');
     }
 };

 // Initialize the FirebaseUI Widget using Firebase.
 var ui = new firebaseui.auth.AuthUI(firebase.auth());
 // The start method will wait until the DOM is loaded.
 ui.start('#firebaseui-auth-container', uiConfig);

 //Button for adding trains
 $("#add-train").on("click", function (event) {
     event.preventDefault();
     //Get user inputs
     var trainName = $("#train-name-input").val().trim();
     var trainDestination = $("#destination-input").val().trim();
     var trainTime = $("#time-input").val().trim();
     var trainFrequency = $("#frequency-input").val().trim();

     //Create local object for holding train data
     var newTrain = {
         name: trainName,
         destination: trainDestination,
         time: trainTime,
         frequency: trainFrequency,
     }

     //Uploads train data to the database
     database.ref().push(newTrain);

     //Clear text fields
     $("#train-name-input").val("");
     $("#destination-input").val("");
     $("#time-input").val("");
     $("#frequency-input").val("");
 });

 //Function holding Firebase event listener for child added
 function displayTrains() {
     //Create Firebase event for adding train to the database and a row to the table
     database.ref().on("child_added", function (childSnapshot) {
         //  console.log(childSnapshot.val());

         //Store everything into a variable
         var trainName = childSnapshot.val().name;
         var trainDestination = childSnapshot.val().destination;
         var trainTime = childSnapshot.val().time;
         var trainFrequency = childSnapshot.val().frequency;

         // First Time (pushed back 1 year to make sure it comes before current time)
         var firstTimeConverted = moment(trainTime, "HH:mm").subtract(1, "years");

         // Difference between the times
         var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

         // Time apart (remainder)
         var timeRemainder = diffTime % trainFrequency;

         //Calculate minutes away
         var minutesAway = trainFrequency - timeRemainder;
         //  console.log("Minutes away: " + minutesAway)

         //Calculate next arrival
         var nextArrival = moment().add(minutesAway, "minutes")

        //  var deleteButton = $("<button class='delete'>").text("X");

         //Create new row
         var newRow = $("<tr>").append(
             $("<td>").text(trainName),
             $("<td>").text(trainDestination),
             $("<td>").text(trainFrequency),
             $("<td>").text(moment(nextArrival).format("hh:mm")),
             $("<td>").text(minutesAway),
            //  $("<td>").html(deleteButton)
         );

         newRow.addClass("new-row");

         // Append the new row to the table
         $("#train-table-body").append(newRow);
     });
 }

//  $(document).on("click", "button.delete", function () {
//      event.preventDefault();
//      console.log("test")
//      //   $(this).parents(".new-row").remove()
//      database.ref("/name/").child(name).remove();
//  })

 //Function that will update the table
 function updateTime() {
     //Clear table
     $("#train-table-body").empty();
     //Load updated table
     displayTrains();
 }

 //Calling updateTime function
 updateTime();

 //  Set interval to run updateTime every 100ms
 setInterval(function () {
     updateTime();
 }, 500);