// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '716322429169-uka8nvtq0mf943iq46h5bbgjsfdslm80.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
    gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
    }, handleAuthResult);
    [78 / 371]
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
    var authorizeDiv = document.getElementById('authorize-div');
    if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        authorizeDiv.style.display = 'none';
        loadSheetsApi();
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        authorizeDiv.style.display = 'inline';
    }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
    gapi.auth.authorize({
        client_id: CLIENT_ID,
    scope: SCOPES,
    immediate: false
    },
    handleAuthResult);
    return false;
}

/**
 * Load Sheets API client library.
 */
function loadSheetsApi() {
    [39 / 371]
        var discoveryUrl =
        'https://sheets.googleapis.com/$discovery/rest?version=v4';
    gapi.client.load(discoveryUrl).then(fetchSheets);
}

/*
 * find out who has tutored the most
 */
function process(tutorsResponse){
    var EarlyBird = 0;
    var AfterSchool = 10;
    var tutorSessions = tutorsResponse.result;
    var totalVisits = [0,0,0,0,0,0,0,0,0,0];
    var cycle = -1;
    var lastPeriod = -1;
    for(var i = 0; i < tutorSessions.values.length; i++){
        var period = tutorSessions.values[i][2]; 
        if(period == "Early Bird"){ 
            period = 0; 
        } else if (period == "After school"){
            period = 10;
        } else {
            period = parseInt(period);
        } 
        totalVisits[period]++;
        if (period < lastPeriod){
            cycle++;
        }
        lastPeriod = period;
    }
    output("Early Bird " , (totalVisits[0]/cycle).toFixed(2));
    for(var i = 1; i<totalVisits.length - 1; i++)
        output("Period" + i , (totalVisits[i]/cycle).toFixed(2));
    output("After School ", (totalVisits[9]/cycle).toFixed(2));
}

/**
 * fetch sheets and dispatch method to process them 
 */
function fetchSheets() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1L3_WojemoFeh9qTPOtIl2_leXpKAQ308jX7lgED96X0',
    range: 'Form Responses 1',
    }).then(function(tutorsResponse){
        process(tutorsResponse);
    }, function(response) {
        console.log("error");
    });
}
/**
 * Append a message to the output element 
 *
 * @param {string} message Text to be placed in output element.
 */
function output(timePeriod, amount) {
    var table = document.getElementById("output");
    var row = table.insertRow();
    row.insertCell().innerText = timePeriod;
    row.insertCell().innerText = amount;
}
