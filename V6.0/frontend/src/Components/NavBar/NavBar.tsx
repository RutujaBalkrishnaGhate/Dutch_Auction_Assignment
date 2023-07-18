import React from 'react';
import './NavBar.css';
import logo from '../../logo.svg'
import {ethers} from 'ethers';

declare global {
    interface Window {
        ethereum: any;
    }
}

// @ts-ignore
class NavBar extends React.Component{

    connect = async () => {

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        console.log("trying to connect");

        const accounts = await provider.listAccounts(); // get the list of accounts
        const wallet = document.getElementById("walletAddress");
        const balance = document.getElementById("balance");
        const block = document.getElementById("blockNumber");

        if (wallet) {
            wallet.textContent = `${accounts[0]}`;
        }

        if (balance) {
            const balanceInWei = await provider.getBalance(accounts[0]);
            const bal = ethers.utils.formatEther(balanceInWei);
            balance.textContent = `${bal} ETH`;
        }
        if (block) {
            const blockNum = await provider.getBlockNumber();
            block.textContent = `${blockNum}`;
        }

    };

    componentDidMount() {
        (window.ethereum as any).on("chainChanged", this.connect);
        (window.ethereum as any).on("accountsChanged", this.connect);
    }
    render(){
        return (

            <section className={"NavBar"}>
                <div className="logo">
                    <a href="/"><img alt="NFT Dutch Auction" width="75" src={logo}></img></a>
                </div>

                <ul className={"nav-items"}>
                    <li><a href="/"> Home </a> </li>
                    <li><a href="#DeployContract"> Deploy </a> </li>
                    <li><a href="#InteractWithContract"> Buy NFT </a> </li>
                    <li className="nav-cta"><button id = {"connect"} onClick={this.connect}>Connect</button></li>
                </ul>
            </section>
        );
    }
}

export default NavBar;
