import React, { Component } from 'react';

export default class TutorsBreakdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            forbidden : false,
            loading : true,
        }
        //Fetch lit center tutor form
        this.props.gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1L3_WojemoFeh9qTPOtIl2_leXpKAQ308jX7lgED96X0',
            range: 'Class Data!A2:E',
        }).then(function(response) {
            this.setState({
                    conferenceSheet : response
            });
        }, function(response) {
            if (response.result.error.code === 403) {
                this.setState({forbidden : true });
            }
            console.error("failed to fetch literacy conference spreadsheet");
            console.error(response);
        }.bind(this));
        //Fetch renta tutor form
        this.props.gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1ww32qT92-5j7_VuCkH2kDROagMfeZWtso7pQe40AiEE',
            range: 'Class Data!A2:E',
        }).then(function(response) {
            this.setState({
                    rentaSheet : response
            });
        }, function(response) {
            if (response.result.error.code === 403) {
                this.setState({forbidden : true });
            }
            console.error("failed to fetch literacy conference spreadsheet");
            console.error(response);
        }.bind(this));
    }
    componentWillUpdate() {
        //add logic to determine if both sheets are fetched
    }
    render() {
        if ( this.state.forbidden ) {
            return (
                <p> 
                    You are forbidden from accessing the necessary sheets.
                    try a different account
                </p>
            );
        }
        return (
            <p> The report will be here eventually </p>
        );
    }
}
