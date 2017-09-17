import React, { Component } from 'react';
import { 
    Table, ControlLabel, FormGroup, HelpBlock, FormControl, Grid, Row, Col, Radio,
    Alert, Button
} from 'react-bootstrap';

function FieldGroup({ id, label, help, ...props }) {
    return (
        <FormGroup controlId={id}>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
        {help && <HelpBlock>{help}</HelpBlock>}
        </FormGroup>
    );
}

export default class TutorsBreakdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            forbidden : false,
            sort : this.sortByTotal,
            substring : '',
        }
        //Fetch lit center tutor form
        this.getSheet({
            spreadsheetId: '1L3_WojemoFeh9qTPOtIl2_leXpKAQ308jX7lgED96X0',
            range: 'Form Responses 1',
            majorDimension: 'ROWS',
        }, 'conferenceSheet');
        //Fetch renta tutor form
        this.getSheet({
            spreadsheetId: '1ww32qT92-5j7_VuCkH2kDROagMfeZWtso7pQe40AiEE',
            range: 'Form Responses 2!A2:E',
            majorDimension: 'ROWS',
        }, 'rentaSheet');
    }
    getSheet(params, name) {
        this.props.gapi.client.sheets.spreadsheets.values.get(params).then(function(response) {
            this.setState({
                //Computed property
                [name]: response.result
            });
        }.bind(this), function(response) {
            if (response.result.error.code === 403) {
                this.setState({forbidden : true });
            } else {
                console.error("failed to fetch literacy conference spreadsheet");
                console.error(response);
            }
        }.bind(this));
    }
    parseTimeString(string) {
        //month/day/year hour:minute:sec
        //8/24/2017 15:43:41
        let parts = string.match(
           /(\d+)\/(\d+)\/(\d+) (\d+):(\d+):(\d+)/ 
        );
        return (new Date(parts[3], parts[1], parts[2], parts[4], parts[5], parts[5])).getTime();
    }
    agregateTutors(renta, conference) {
        //Conference Sheet
        //Timestamp (0), ID of tutee (1), period(2), required visit (yes or no) (3), 
        //who is filling out form(4), email adress of tutee's teacher (5),
        //Tutor name (6), name of class (7), materials brought by tutee (8),
        //what was discussed (9), what will tutee work on after conference (10),
        //follow up recomended (yes or no) (11), reason attending (12), 
        //Process into object with key as upper case name with _ for each tutor
        let result = {};
        for (let i = 1; i<conference.values.length; i++) {
            let row = conference.values[i];
            //match until opening angle bracket to extract name
            //then upper case it for regularity
            //hopefully no one's name has a bracket in it
            let name = row[6].match(/[^<]*/)[0].toUpperCase();
            //check if tutor has been added to dict yet
            if (!(name in result)) {
                result[name] = {
                    conf : 0,
                    rented : 0,
                    timeStamps : [],
                };
            }
            result[name].conf= result[name].conf+ 1;
            result[name].timeStamps.push(this.parseTimeString(row[0]));
            result[name].prettyName = this.prettyNameFromEmail(row[6]);
        }
        //FIND OUT WHAT FORMAT RENTA TUTOR NAMES ARE IN
        //IE IS THERE A COMMA BETWEEN NAMES OR A SPACE OR BOTH
        /*
        for (let i = 1; i<renta.values.length; i++) {
            let row = renta.values[i];
            let names = row[1].map(name => name.match(/
        }
        */
        return result;
    }
    //credit
    //https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
    toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }
    //To be improved
    prettyNameFromEmail(nameString) {
        let name = nameString.match(/[^<]*/)[0].replace('_', ', ').replace(/_/g, ' ');
        //let lastNamePart = name.match(/[^_]*/);
        //let begining = name.substring(lastNamePart[0].length + lastNamePart.index);
        return this.toTitleCase(name);
    }
    sortByName(data) {
        return Object.keys(data).sort(function(a, b) {
            //' ' is less than all ascii so short last name will be below long
            return a.replace(/_/g, ' ').localeCompare(b.replace(/_/g, ' '));
        });
    }
    sortByTotal(data) {
        let keys = Object.keys(data);
        keys.sort(function(a, b) {
            return (data[b].conf + data[b].rented)-(data[a].conf - data[a].rented);
        });
        return keys;
    }
    render() {
        let content = null;
        if ( this.state.forbidden ) {
            content = (
                <Alert bsStyle="danger">
                <h4>Your account does not have access to the necessary spreadsheets!</h4>
                <p>Sign in to a google account with access to the necessary spreadsheets
                to view this site</p>
                <p>
                <Button bsStyle="danger" onClick={this.props.signOut}>Sign out</Button>
                </p>
                </Alert>
            );
        }
        else if ((this.state.rentaSheet == null) || 
            (this.state.conferenceSheet == null)) {
            content = (
                <p className="text-center"> loading </p>
            );
        } else {
            //Table format
            //name, conference, rented, total
            let processedData = this.agregateTutors(this.state.rentaSheet,this.state.conferenceSheet);
            let tableRows = [];
            let names = this.state.sort(processedData).filter((a)=>a.toLowerCase().indexOf(this.state.substring)>-1);
            for (let name of names){
                let row = (<tr key={name}>
                    <td> {processedData[name].prettyName} </td>
                    <td> {processedData[name].conf} </td>
                    <td> {processedData[name].rented} </td>
                    <td> {processedData[name].conf+processedData[name].rented} </td>
                    </tr>
                );
                tableRows.push(row);
            }
            content = (
                <Table striped bordered condensed hover>
                <thead>
                <tr>
                <th> Name </th>
                <th> # of Tutor Sessions at Litcenter </th>
                <th> # of Times Rented </th>
                <th> Total Number of Tutoring Sessions </th>
                </tr>
                </thead>
                <tbody>
                {tableRows}
                </tbody>
                </Table>
            );
        }
        return (
            <Grid fluid={true}>
            <Row>
            <Col xs={2} sm={2} md={2} lg={2} >
            <form>
                <FieldGroup
                  id="searchForm"
                  type="text"
                  label="Search"
                  placeholder="Name"
                onChange={(e)=>this.setState({substring:e.target.value.toLowerCase()})}
                />
                <FormGroup>
                <ControlLabel> Sort by </ControlLabel><br/>
                  <Radio name="searchRadio" inline defaultChecked
                    onClick={()=>this.setState({sort:this.sortByTotal})}>
                    Total
                  </Radio>
                  {' '}
                  <Radio name="searchRadio" inline
                    onClick={()=>this.setState({sort:this.sortByName})}>
                    Name
                  </Radio>
                </FormGroup>
            </form>
            </Col>
            <Col xs={8} sm={8} md={8} lg={8} >
            {content}
            </Col>
            </Row>
            </Grid>
        );
    }
}
