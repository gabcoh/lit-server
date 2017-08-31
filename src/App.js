import React, { Component } from 'react';
import logo from './logo.svg';
import LogInView from './LogIn.js'
import './App.css';

class App extends Component {
  render() {
    if (this.state.authorized) {
        return(
            <p> youre authorized! </p>
        );
    } else {
        return (
            <LogInView />
        )
    }
  }
}

export default App;
