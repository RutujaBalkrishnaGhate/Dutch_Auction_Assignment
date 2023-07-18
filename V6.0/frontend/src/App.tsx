import React from 'react';
import './App.css';

import Homepage from "./Components/HomePage/HomePage";
import DeployContract from "./Components/DeployContract/DeployContract";
import InteractWithContract from "./Components/InteractWithContract/InteractWithContract";
import NavBar from "./Components/NavBar/NavBar";
import StatusBar from "./Components/StatusBar/StatusBar";

class App extends React.Component {
    render(){
        return (
            <div className="App">
                <NavBar />
                <StatusBar/>
                <Homepage />
                <DeployContract /><br></br><br></br>
                <InteractWithContract />
            </div>
        );
    }
}

export default App;
