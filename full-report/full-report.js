/* add feture to search for someone and then move to them and highlight there name
   highlight with style 
   move to with url and id
   */
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
        document.getElementById('post-auth').style.display= "";
        loadSheetsApi();
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        authorizeDiv.style.display = 'initial';
        document.getElementById('post-auth').style.display= "none";
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

var index = 2;
function compareByIndex(arr1, arr2){
    if(arr1[index] > arr2[index])
        return -1;
    else if(arr1[index] == arr2[index])
        return 0;
    return 1;
}

//var keepProccessed = [];
function process(tutorsResponse, rentaResponse, idsResponse){
    var id = idsResponse.result;
    var tutorSessions = tutorsResponse.result;
    var rentaSessions = rentaResponse.result;
    var idMap = {};
    /*
       Tutors
       ID    #Times Tutored
       Name Single Renta Combined
       00000 Gabe 10    3       13
       */
    //ids -> times tutored
    var single = {};
    var renta = {};
    for (var i = 0; i < id.values.length; i++){
        idMap[id.values[i][1]+"_"+id.values[i][2]] = id.values[i][0];
    }
    var tutValues = tutorSessions.values;
    var rentValues = rentaSessions.values;
    var names = new Set(); 
    for (var i = 1; i<Math.max(tutValues.length, rentValues.length); i++){
        if(i< tutValues.length){
            if(tutValues[i][6] in single)
                single[tutValues[i][6]]++;
            else
                single[tutValues[i][6]] = 1;
            if (! names.has(tutValues[i][6]))
                names.add(tutValues[i][6]); 
        }
        if(i< rentValues.length){
            var rentaTutors = rentValues[i][1].split(",").map(function(str) { return str.trim()});
            for (var x = 0; x<rentaTutors.length; x++){
                var abc = rentaTutors[x];
                if(abc in renta)
                    renta[abc]++;
                else
                    renta[abc] = 1;
                if (! names.has(abc))
                    names.add(abc); 
            }
        }
    }
    var table = [];
    //when printing loop over keys in renta and single 
    //and use them to find id and to find single and Renta tutors
    for (let name of Array.from(names.values())) {
        var id = undefined;
        if ( name.replace(/<.*>/, "") in idMap)
            id = idMap[name.replace(/<.*>/, "")];
        else if ( name.toUpperCase().replace(/<.*>/, "") in idMap)
            id = idMap[name.toUpperCase().replace(/<.*>/, "")];
        else if ( name.replace(/(.*)_(.*)_(.*)<.*>/, "$1_$2 $3"))
            id = idMap[name.replace(/(.*)_(.*)_(.*)<.*>/, "$1_$2 $3")];
        else if ( name.replace(/(.*_(.*)_(.*)<.*>/, "$1 $2_$3"))
                id = idMap[name.replace(/(.*_(.*)_(.*)<.*>/, "$1 $2_$3")];
        else if ( name.replace(/(.*)_(.*)_(.*)<.*>/, "$1_$2 $3").toUpperCase())
        id = idMap[name.replace(/(.*)_(.*)_(.*)<.*>/, "$1_$2 $3").toUpperCase()];
        else if ( name.replace(/(.*_(.*)_(.*)<.*>/, "$1 $2_$3").toUpperCase())
            id = idMap[name.replace(/(.*_(.*)_(.*)<.*>/, "$1 $2_$3").toUpperCase()];
        var sing = 0;
        if (name in single)
            sing = single[name];
        var rent;
        var comb = undefined;
        if (name in renta) {
            rent = renta[name];
        }
        else{
            rent = 0;
        }
        comb = rent + sing;
        table.push([name.replace(/(.*)<.*>/, "$1").replace(/_([a-zA-z])/, ", $1").replace("_", " "),
            name.replace(/.*<(.*)>/, "$1") + "", sing, rent, comb]);
    } 
    var ind = 1;
    var sortType = document.querySelector('input[name = "sort"]:checked').value;
    switch(sortType) {
        case "name":
            this.index = 0;
            break;
        case "lit":
            this.index = 2;
            break;
        case "rented":
            this.index = 3;
            break;
        case "total":
            this.index = 4;
            break;
    }
    //keepProccessed = [[]];
    for(let row of table.sort(compareByIndex)){
        if(row[1].includes("d219.org")){
            addRow(true, row[0].toLowerCase().replace(",", ""), ind++, ...row);
            //keepProccessed.push([false, row[0].toLowerCase().replace(",", ""), ind++, ...row]);
        }
        else{
            addRow(false, row[0].toLowerCase().replace(",", ""), ind++, ...row);
            //keepProccessed.push([false, row[0].toLowerCase().replace(",", ""), ind++, ...row]);
        }
    }
}

var keepTutorsResponse = null;
var keepIdsResponse = null;
var keepRentaResponse = null;
/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1L3_WojemoFeh9qTPOtIl2_leXpKAQ308jX7lgED96X0/edit
 */
function fetchSheets() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1L3_WojemoFeh9qTPOtIl2_leXpKAQ308jX7lgED96X0',
        range: 'Form Responses 1'
    }).then(function(tutorsResponse){
        window.keepTutorsResponse = tutorsResponse;
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1ww32qT92-5j7_VuCkH2kDROagMfeZWtso7pQe40AiEE',
            range: 'Form Responses 1'
        }).then(function(rentaResponse){
            window.keepRentaResponse = rentaResponse;
            gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: '1L3_WojemoFeh9qTPOtIl2_leXpKAQ308jX7lgED96X0',
                range: 'studentIdNums'
            }).then(function(idResponse){
                window.keepIdsResponse = idResponse;
                process(tutorsResponse, rentaResponse, idResponse);
            })
        })
    }, setUnauthorized);
}
function refresh(){
    document.getElementById("output").innerHTML =`<tr>
        <th>#</th>
        <th>Name</th>
        <th>Email</th>
        <th>Lit Center Tutor Sessions</th>
        <th>Rented Tutor Sessions</th>
        <th>Total</th>
        </tr>`;

    process(window.keepTutorsResponse, window.keepRentaResponse, window.keepIdsResponse);
}
/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function addRow() {
    if(!document.querySelector('input[name = "teachers"]').checked &&arguments[0])
        return;
    var table = document.getElementById("output");
    var row = table.insertRow();

    if(arguments[0]) {
        row.setAttribute("occupation", "teacher");
    }
    row.id = arguments[1];
    for (var i = 2; i < arguments.length; i++) {
        row.insertCell().innerText = arguments[i];
    }
}

var idLoc = 0;
var matchedIds = [];
function search(){
    var query = document.querySelector('input[name = "search"]').value.toLowerCase();
    var table = document.getElementById('output'); 
    matchedIds = [];
    for (let row of [...table.rows].slice(1)){
        if(row.id.match(query)){
            matchedIds.push(row.id);
            row.style = "";
        }
        else{
            row.style = "display:none"
        }
    }
    //move();
}
function move(){
    if(event != undefined && event.keyCode == 13 && matchedIds.length>=0){
        window.location.hash ="#"+ matchedIds[idLoc % matchedIds.length];
        idLoc++;
    }
}

//window.onkeydown = move;
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
