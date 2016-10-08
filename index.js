var CLIENT_ID = '716322429169-uka8nvtq0mf943iq46h5bbgjsfdslm80.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

function checkAuth() {
    gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
    }, handleAuthResult);
    [78 / 371]
}


function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        document.getElementsByClassName('post-auth')[0].style.display= "";
        document.getElementsByClassName('pre-auth')[0].style.display="none";
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        document.getElementsByClassName('post-auth')[0].style.display="none";
        document.getElementsByClassName('pre-auth')[0].style.display="initial";
    }
}
function handleAuthClick(event) {
    gapi.auth.authorize({
            client_id: CLIENT_ID,
            scope: SCOPES,
            immediate: false
        },
        handleAuthResult);
    return false;
}
