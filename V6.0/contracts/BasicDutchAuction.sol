// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
* @title Basic Dutch Auction Smart Contract Assignment
* @author Rutuja Balkrishna Ghate
*/

contract BasicDutchAuction {
    /*** state variables ***/
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;

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
        require(isAuctionOpen(), "Auction is closed");
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
