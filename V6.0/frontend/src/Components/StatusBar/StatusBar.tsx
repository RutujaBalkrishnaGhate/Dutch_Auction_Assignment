import "./StatusBar.css";
import React from 'react';

class StatusBar extends React.Component {
    render(){
        return(
            <section id={"status"} className={"Status"}>
                <ul className="info">
                    <li className={"label"}>Wallet Address</li>
                    <li id="walletAddress"></li>
                    <li className={"label"}>Balance</li>
                    <li id="balance"></li>
                    <li className={"label"}>Block Number</li>
                    <li id="blockNumber"></li>
                </ul>
            </section>
        )
    }
}

export default StatusBar;