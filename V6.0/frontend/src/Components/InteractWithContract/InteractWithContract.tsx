import "./InteractwithContract.css";

import React from "react";
import {ethers} from "ethers";

import ABI from "../../artifacts/contracts/BasicDutchAuction.sol/BasicDutchAuction.json";

// @ts-ignore
class InteractWithContract extends React.Component{

    getInfo = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const adr = document.getElementById('Contract Address') as HTMLInputElement

        const info_status = document.getElementById("info-status") as HTMLElement;
        info_status.textContent = `Please wait...`;

        try{

            const basicDutchAuction = new ethers.Contract(
                // @ts-ignore
                adr.value.toString(),
                ABI.abi,
                signer
            );

            const status = await basicDutchAuction.auctionStatusOpen();
            const price = await basicDutchAuction.currentPrice();
            const seller = await basicDutchAuction.seller();
            const buyer = await basicDutchAuction.buyer();
            const reserve = await basicDutchAuction.reservePrice();
            const blocks = await basicDutchAuction.numBlocksAuctionOpen();
            const dec = await basicDutchAuction.offerPriceDecrement();

            const statusElement = document.getElementById('state');
            const priceElement = document.getElementById('price');
            const sellerElement = document.getElementById('seller');
            const buyerElement = document.getElementById('buyer');
            const contractElement = document.getElementById('contract');
            const basePrice = document.getElementById('basePrice');
            const tenure = document.getElementById('tenure');
            const decrement = document.getElementById('decrement');

            if (buyerElement !== null) {
                buyerElement.textContent = buyer;
            }

            if (sellerElement !== null) {
                sellerElement.textContent = seller;
            }

            if (priceElement !== null) {
                priceElement.textContent = price;
            }

            if (statusElement !== null) {
                statusElement.textContent = status;
                if(status === true){
                    info_status.textContent = `Auction is Open`;
                }else{
                    info_status.textContent = `Auction is Closed`;
                }

            }

            if (contractElement !== null) {
                contractElement.textContent = adr.value.toString();
            }

            if(basePrice != null){
                basePrice.textContent = reserve;
            }

            if(tenure != null){
                tenure.textContent = blocks;
            }

            if(decrement != null){
                decrement.textContent = dec;
            }

        }catch (error: any) {
            window.alert(
                'Error!' + (error && error.reason ? `\n\n${error.reason}` : `${error.message}`)
            );
            info_status.textContent = error.reason;
        }
    }

    bid = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const adr = document.getElementById('Contract Address') as HTMLInputElement

        try {

            const bidInput = document.getElementById("Bid Price") as HTMLInputElement;
            const bidValue = bidInput.value;

            const deployed = document.getElementById("winner") as HTMLElement;
            deployed.textContent = `Please wait... Processing transaction`;

            const basicDutchAuction = new ethers.Contract(
                adr.value.toString(),
                ABI.abi,
                signer
            );

            const biding = await basicDutchAuction.bid({value: `${bidValue}`});
            const receipt = await biding.wait();
            window.alert(`You are the winner and your tx hash is ${receipt.transactionHash}`);
            deployed.textContent = `You are the Winner`;

        } catch (error: any) {
            window.alert(
                'Error!' + (error && error.reason ? `\n\n${error.reason}` : `${error.message}`)
            );
            const deployed = document.getElementById("winner") as HTMLElement;
            deployed.textContent = error.reason.split(": ")[1];
        }
    }

    render() {
        return (
            <section id={"InteractWithContract"} className={"InteractWithContract"}>
            <div className={"infoStat"}>
                <div className={"params-outline"}>
                    <div className="params">
                        <label htmlFor="Contract Address" className="paramLabel">Contract Address</label>
                        <input id="Contract Address" type="text" placeholder="<Contract Address>"></input>
                    </div>

                    <div className="deploy-btn">
                        <button onClick={this.getInfo}>Get Info</button>
                    </div>

                </div>
                <div id = "info-status" className={"info-status"}>Check Status of Contract</div>
            </div>

                <ul className="info">
                        <li className={"label"}>Status</li>
                        <li id="state"></li>
                        <li className={"label"}>Current Price</li>
                        <li id="price"></li>
                        <li className={"label"}>Contract</li>
                        <li id="contract"></li>
                </ul>
                <ul className="info">
                    <li className={"label"}>Base Price</li>
                    <li id="basePrice"></li>
                    <li className={"label"}>Tenure</li>
                    <li id="tenure"></li>
                    <li className={"label"}>Decrement by Block</li>
                    <li id="decrement"></li>
                </ul>

                <ul className="info">
                    <li className={"label"}>Seller</li>
                    <li id="seller"></li>
                    <li className={"label"}>Buyer</li>
                    <li id="buyer"></li>
                </ul>

                <div className={"params-outline"}>
                    <div className="params">
                        <label htmlFor="Bid Price" className="paramLabel">Your Bid Price</label>
                        <input id="Bid Price" type="text" placeholder="<Bid price>"></input>
                    </div>

                    <div className="deploy-btn">
                        <button onClick={this.bid}>Bid</button>
                    </div>
                </div>

                <div id = "winner" className={"winner"}>Place your Bid</div>
            </section>
        );
    }
}

export default InteractWithContract;
