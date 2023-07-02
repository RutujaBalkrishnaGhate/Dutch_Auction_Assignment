# Dutch_Auction_Project
Rutuja Balkrishna Ghate
NUID:-002749465

<h1>Dutch Auction</h1>
The Basic Dutch Auction is a Solidity smart contract that facilitates the auction of a single, physical item at a single auction event. The contract implements a Dutch auction mechanism where the price decreases over time until a bid equal to or higher than the current price is submitted.

Contract Overview
The BasicDutchAuction contract is initialized with the following parameters:

reservePrice: The minimum amount of wei that the seller is willing to accept for the item.
numBlocksAuctionOpen: The number of blockchain blocks that the auction is open for.
offerPriceDecrement: The amount of wei that the auction price decreases by during each subsequent block.
The auction begins when the contract is deployed, and the initial price is calculated as follows:

initialPrice = reservePrice + numBlocksAuctionOpen * offerPriceDecrement
Bids can be submitted by both externally-owned accounts and contract accounts. The first bid that is greater than or equal to the current price is considered the winning bid. The wei amount from the winning bid is transferred immediately to the seller, and the contract stops accepting further bids. All other bids are refunded immediately.

Getting Started
To use the Basic Dutch Auction contract, follow these steps:

Clone the repository and navigate to the v1.0 directory.
Install the required dependencies by running npm install.
Initialize the Hardhat project by running npx hardhat init.
Implement the BasicDutchAuction.sol contract according to your requirements.
Write thorough test cases in the BasicDutchAuction.test.js file to ensure the contract's functionality.
Run the tests using npx hardhat test.
Generate a Solidity coverage report by running npx hardhat coverage.
Commit the coverage report to your repository to track the contract's code coverage.
Dependencies
The project uses the following dependencies:

Hardhat: A development environment for Ethereum smart contracts.
Solidity: The programming language used to write smart contracts.
Hardhat Ethers: Plugin for Hardhat to handle ethers.js integration.
Hardhat Etherscan: Plugin for Hardhat to verify and publish contracts on Etherscan.
Ethereum Waffle: Testing framework for Ethereum smart contracts.
Chai: Assertion library for testing.
Solidity Coverage: Plugin for Hardhat to generate code coverage reports.
Please refer to the official documentation for each dependency to learn more about their usage and configuration.

Contributions
Contributions to the Basic Dutch Auction contract are welcome! If you have any suggestions, improvements, or bug fixes, please feel free to submit a pull request.

License
The Basic Dutch Auction contract is released under the MIT License.

