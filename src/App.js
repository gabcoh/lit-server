import React, { Component } from 'react';
import TutorReport from './TutorReport';
import { Navbar, Nav, NavItem } from 'react-bootstrap';

class App extends Component {
    // Client ID and API key from the Developer Console
    CLIENT_ID = '716322429169-uka8nvtq0mf943iq46h5bbgjsfdslm80.apps.googleusercontent.com';

    // Array of API discovery doc URLs for APIs used by the quickstart
    DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
    constructor(props) {
        super(props);
        this.state = {
            signedIn: false,
            gapiReady : false,
        }
        this.loadGAPI();
    }
    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    initClient() {
        window.gapi.client.init({
            discoveryDocs: this.DISCOVERY_DOCS,
            clientId: this.CLIENT_ID,
            scope: this.SCOPES
        }).then(function () {
            this.setState({ gapiReady: true });

            // Listen for sign-in state changes.
            window.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus.bind(this));

            // Handle the initial sign-in state.
            this.updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
        }.bind(this));
    }
    loadGAPI() {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";

        script.onload = () => {
            window.gapi.load('client:auth2', this.initClient.bind(this));
        };

        document.body.appendChild(script);
    }
    /**
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            //this.checkClientAccess();
            this.setState({signedIn:true});
        } else {
            this.setState({signedIn:false});
        }
    }
    handleAuthClick() {
        window.gapi.auth2.getAuthInstance().signIn();
    }
    handleSignoutClick() {
        window.gapi.auth2.getAuthInstance().signOut();
    }
    render() {
        let content = null;
        let navbarButton = null;
        if(!this.state.gapiReady) {
            content = (
                <p className="text-center">loading</p>
            );
        } else if (this.state.signedIn) {
            content = (
                <div>
                <TutorReport gapi={window.gapi} />
                </div>
            );
            navbarButton = (
                <NavItem eventKey={2} onClick={this.handleSignoutClick}>Sign Out</NavItem>
            );
        } else {
            content = (
                <p className="text-center">Please Sign In to View Content</p>
            );
            navbarButton = (
                <NavItem eventKey={2} onClick={this.handleAuthClick}>Sign In</NavItem>
            );
        }
        return ( 
            <div>
			<Navbar collapseOnSelect> <Navbar.Header> <Navbar.Brand> Lit Center </Navbar.Brand> <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
            <Nav pullRight>
            {navbarButton}
            </Nav>
            </Navbar.Collapse>
            </Navbar>
            <div className="container containerFluid">
            {content}
            </div>
            </div>
        );
    }
}

export default App;
