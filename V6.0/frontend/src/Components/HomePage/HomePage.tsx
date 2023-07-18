import "./HomePage.css";
import icon from "../../logo.svg";

import React from 'react';

class Homepage extends React.Component {
    render(){
        return (

            <section className={"Home"}>
                <div className={"description"}>
                    <div>
                        <h1> NFT Dutch Auction</h1>
                    </div>

                    <div>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit corporis possimus, perferendis
                            nulla deleniti, qui itaque aut aspernatur, hic eveniet quis delectus dolores laborum aliquid
                            officiis ducimus recusandae laudantium adipisci?</p>
                    </div>

                    <div className={"buttons"}>
                        <button className="btn"><a href="#DeployContract">Deploy</a></button>
                        <button className="btn"><a href="#InteractWithContract">Buy</a></button>
                    </div>
                </div>

                <div className={"cover-image"}>
                    <img alt="test" width="500" src={icon}></img>
                </div>

            </section>

        );
    }

}

export default Homepage;