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
    if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        document.getElementById("post-auth").style.visibility = "visible";
        document.getElementsByClassName('pre-auth')[0].style.display="none";
        loadSheetsApi();
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        document.getElementsByClassName('pre-auth')[0].style.display="initial";
        document.getElementById("post-auth").style.visibility = "hidden";
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

//var keepProccessed = [];
function process(tutorsResponse, idsResponse){
    var id = idsResponse.result;
    var tutorSessions = tutorsResponse.result;
    var idMap = {};
    var visitsMap = {};
    for (var i = 0; i < id.values.length; i++){
        idMap[id.values[i][0]] = id.values[i][1]+" "+id.values[i][2];
    }
    for(i = 1; i < tutorSessions.values.length; i++){
        if(tutorSessions.values[i][1] in visitsMap){
            visitsMap[tutorSessions.values[i][1]]++;
        } else {
            visitsMap[tutorSessions.values[i][1]] = 1;
        }
    }
    var maxKey = 0;
    var maxValue = 0;
    for (var key in visitsMap){
        if (visitsMap[key] > maxValue){
            maxKey = key;
            maxValue = visitsMap[key]; 
        }
    }
    var keys = Object.keys(visitsMap);
    var total = 0;
    keys.sort(function(a, b){ return visitsMap[b]-visitsMap[a]});
    //keepProccessed = [[]];
    for(let key of keys){
        if(key in idMap) {
            addRow(key, idMap[key].replace(" ", ", "), visitsMap[key]);
            total += visitsMap[key];
            //keepProccessed.push([key, idMap[key].replace(" ", ", "), visitsMap[key]]);
        }
        else{
            addRow(key, "Unknown", visitsMap[key]);
            total += visitsMap[key];
            //keepProccessed.push([key, "Unknown", visitsMap[key]]);
        }
    }
    document.getElementById("num-tut").innerText = keys.length + " kids tutored";
    document.getElementById("tot-tut").innerText = total + " sessions";
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1L3_WojemoFeh9qTPOtIl2_leXpKAQ308jX7lgED96X0/edit
 */
function fetchSheets() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1L3_WojemoFeh9qTPOtIl2_leXpKAQ308jX7lgED96X0',
    range: 'Form Responses 1',
    }).then(function(tutorsResponse){
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1L3_WojemoFeh9qTPOtIl2_leXpKAQ308jX7lgED96X0',
        range: 'studentIdNums',
        }).then(function(idsResponse){
            process(tutorsResponse, idsResponse);
        }, function(response) {
            console.log("error");
        });
    }, setUnauthorized);
}
function addRow() {
    var table = document.getElementById("output");
    var row = table.insertRow();
    row.id = arguments[1];
    for (var i = 0; i < arguments.length; i++) {
        row.insertCell().innerText = arguments[i];
    }
}
var matchedIds = [];
function search(){
    var query = document.querySelector('input[name = "search"]').value.toLowerCase();
    var table = document.getElementById('output'); 
    var name = document.getElementById("by name").checked;
    matchedIds = [];
    for (let row of [...table.rows].slice(1)){
        var comp = undefined;
        if(name == true) {
            comp = row.id.toLowerCase();
        }
        else {
            comp = row.cells[0].innerText;
        }
        if(comp.match(query.toLowerCase())){
            matchedIds.push(row.id);
            row.style = "";
        }
        else{
            row.style = "display:none"
        }
    }
}
function setUnauthorized(){
    document.getElementsByClassName("post-authorized")[0].innerText="You aren't authorized"; 
}
function exportCSV(arr){
    var csvContent = "data:text/csv;charset=utf-8,";
    var index=0;
    for(let infoArray of arr){
        dataString = infoArray.join(",");
        csvContent += index++ < arr.length ? dataString+ "\n" : dataString;
    } 
    window.open(csvContent);
}
