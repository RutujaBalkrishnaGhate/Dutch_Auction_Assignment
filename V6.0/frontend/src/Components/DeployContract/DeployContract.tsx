import "./DeployContract.css";
import React from "react";
import {ethers} from "ethers";
import ABI from '../../artifacts/contracts/BasicDutchAuction.sol/BasicDutchAuction.json';

// @ts-ignore
class DeployContract extends React.Component {
    deploy = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const BasicDutchAuction = new ethers.ContractFactory( ABI.abi, ABI.bytecode, signer);

        try {

            const basePriceInput = document.getElementById("Base Price") as HTMLInputElement;
            const tenureInput = document.getElementById("Tenure") as HTMLInputElement;
            const decrementInput = document.getElementById("Decrement") as HTMLInputElement;

            const basePrice = basePriceInput.value;
            const tenure = tenureInput.value;
            const decrement = decrementInput.value;

            const deployed = document.getElementById("deployedAt") as HTMLElement;

            const basicDutchAuction = await BasicDutchAuction.deploy(basePrice,tenure,decrement);
            deployed.textContent = `Please wait...`;
            await basicDutchAuction.deployed();
            const deployedAddress = basicDutchAuction.address;

            window.alert(`Contract deployed to: ${deployedAddress}`);
            deployed.textContent = `Deployed at ${deployedAddress}`;

        } catch (error: any) {
            window.alert(
                'Error!' + (error && error.reason ? `\n\n${error.reason}` : `${error.message}`)
            );
        }
    }

    render(){
        return (
            <section id="DeployContract" className="deploy-contract">
                <div className="how-it-works">
                    <h3>The BasicDutchAuction.sol contract works as follows:</h3>
                    <ol>
                        <li>
                            The seller instantiates a DutchAuction contract to manage the auction of a single, physical
                            item at a single auction event.
                            <ul>
                                <li>reservePrice: the minimum amount of wei that the seller is willing to accept for the
                                    item
                                </li>
                                <li>numBlocksAuctionOpen: the number of blockchain blocks that the auction is open for
                                </li>
                                <li>reservePrice: the minimum amount of wei that the seller is willing to accept for the
                                    item
                                </li>
                                <li>offerPriceDecrement: the amount of wei that the auction price should decrease by
                                    during each subsequent block
                                </li>
                            </ul>
                        </li>
                        <li>The seller is the owner of the contract</li>
                        <li>The auction begins at the block in which the contract is created</li>
                        <li>The initial price of the item is derived from reservePrice, numBlocksAuctionOpen, and
                            offerPriceDecrement: initialPrice = reservePrice + numBlocksAuctionOpen *
                            offerPriceDecrement
                        </li>
                        <li>A bid can be submitted by any Ethereum externally-owned account.</li>
                        <li>The first bid processed by the contract that sends wei greater than or equal to the current
                            price is the winner. The wei should be transferred immediately to the seller and the
                            contract should not accept any more bids. All bids besides the winning bid should be
                            refunded immediately.
                        </li>
                    </ol>
                </div>

                <div className={"params"}>
                    <label htmlFor="Base Price" className="paramLabel">Base Price</label>
                    <input id="Base Price" type="text" placeholder="<Minimum price>" ></input>
                    <label htmlFor="Tenure" className="paramLabel">Tenure</label>
                    <input id="Tenure" type="text" placeholder="<Tenure of Auction>" ></input>
                    <label htmlFor="Decrement" className="paramLabel">Decrement</label>
                    <input id="Decrement" type="text" placeholder="<Decrement by Block>" ></input>
                </div>

                <div>
                    <button onClick={this.deploy}> <a href="#DeployContract"> Deploy Contract </a></button>
                </div>

                <div id = "deployedAt" className={"deployedAt"}>Deploy Your Contract</div>
            </section>
        );
    }


}

export default DeployContract;
