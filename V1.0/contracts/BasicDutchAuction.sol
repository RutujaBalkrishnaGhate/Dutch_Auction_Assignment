// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;


/**
* @title Basic Dutch Auction Smart Contract
* @author Rutuja Ghate
* Note
* Create a new contract called BasicDutchAuction.sol that implements a Dutch auction called as described below.
* Write test cases to thoroughly test your contracts. Generate a Solidity coverage report and commit it to your repository.
* The BasicDutchAuction.sol contract works as follows:
*  1. The seller instantiates a DutchAuction contract to manage the auction of a single, physical item at a single auction event. The contract is initialized with the following parameters:
*      a. reservePrice: the minimum amount of wei that the seller is willing to accept for the item
*      b. numBlocksAuctionOpen: the number of blockchain blocks that the auction is open for
*      c.offerPriceDecrement: the amount of wei that the auction price should decrease by during each subsequent block.
*  2.The seller is the owner of the contract.
*  3. The auction begins at the block in which the contract is created.
*  4. The initial price of the item is derived from reservePrice, numBlocksAuctionOpen, and  offerPriceDecrement: initialPrice = reservePrice + numBlocksAuctionOpen*offerPriceDecrement
*  5. A bid can be submitted by any Ethereum externally-owned account.
*  6. The first bid processed by the contract that sends wei greater than or equal to the current price is the  winner. The wei should be transferred immediately to the seller and the contract should not accept  any more bids. All bids besides the winning bid should be refunded immediately.
*/

contract BasicDutchAuction {
    /*** state variables ***/
    uint256 private reservePrice;
    uint256 private numBlocksAuctionOpen;
    uint256 private offerPriceDecrement;

    address public buyer = address(0x0);
    address public seller;
    address private owner;

    //a variable initBlock holds the block number in which the contract is instantiated by seller/owner
    // a variable initialPrice holds the initial price set by seller to accept bids
    uint256 private initBlock;
    uint256 private initialPrice;
    bool public auctionStatusOpen;
    uint256 private moneyToSend;


    /**
    * @param basePrice - the base price till which seller will accept bids
    * @param tenure - number of blocks after which this contract will expire
    * @param decrement - price slash block by block
    */
    constructor(uint256 basePrice, uint256 tenure, uint256 decrement){

        owner = payable(msg.sender);
        seller = owner;
        initBlock = block.number;
        auctionStatusOpen = true;

        //assigning local variables to state variables
        reservePrice = basePrice;
        numBlocksAuctionOpen = tenure;
        offerPriceDecrement = decrement;

        //calculating the initial price based on reservePrice, numBlocksAuctionOpen, offerPriceDecrement
        initialPrice = reservePrice + (numBlocksAuctionOpen * offerPriceDecrement);
    }

    // @return block.number - currentBlock function returns the current Block number used on the chain
    function currentBlock() view private returns(uint256){
        return block.number;
    }

    // @return the block difference between the initialised block and the current block in the chain
    function blockDifference() view private returns(uint256){
        return currentBlock() - initBlock;
    }

    // @return the price of Bid that this Dutch auction contract is accepting right now
    function currentPrice() view public returns(uint256){
        return initialPrice - (blockDifference() * offerPriceDecrement);
    }

    //finalizing the auction status
    function finalize(address bidder) private{
        buyer = bidder;
        auctionStatusOpen = false;
    }

    //@return the Auction Status
    function isAuctionOpen() view private returns(bool){
        return blockDifference() <= numBlocksAuctionOpen;
    }

    /**
     * @notice A function that accept bids from any externally owned accounts(EOA)
     * check if the product is already bought if yes then revert the payment
     * check if the Auction is still open for the current block number
     * check if the amount sent by bidder is equal to current price
     * make a transfer to seller or revert the transaction if fails
    */
    function bid() public payable returns(address) {

        //checking the block limit set by the seller to see if Auction is still open
        require(isAuctionOpen(), "Auction is closed");

        //checking if buyer is bidding again
        require(msg.sender != buyer, "You already bought this product");

        //checking if product is available in the market
        require(buyer == address(0), "Product already sold");

        //checking if Bidder is owner of the contract
        require(msg.sender != owner, "Owner can't Bid");

        //condition to check if bidder sent the right amount that matches the current price of the item sold
        require(msg.value >= currentPrice(),"WEI is insufficient");

        //transferring amount to seller only after checking Auction is still open, product is in market and required amount is sent by bidder
        //reverting the transaction if any of the above mentioned conditions isn't met or failure in transfer to seller
        (bool tryToSend, ) = owner.call{ value: currentPrice() }("");
        require(tryToSend == true, "failed to send");

        //finalizing the auction
        finalize(msg.sender);
        return buyer;
    }
}

