
/**
* @title NFT Dutch Auction Smart Contract
* @author Rutuja Balkrishna Ghate
* Note: V2.0
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IUniqueNFT{

    function transferFrom(address _from, address _to, uint _nftId) external;

    function ownerOf(uint id) external view returns (address owner);
}

contract NFTDutchAuction {

    uint256 nftId;
    IUniqueNFT nftAddress;

    /*** state variables ***/
    uint256 private reservePrice;
    uint256 private numBlocksAuctionOpen;
    uint256 private offerPriceDecrement;

    address public buyer;
    address public seller;

    //a variable initBlock holds the block number in which the contract is instantiated by seller/owner
    // a variable initialPrice holds the initial price set by seller to accept bids
    uint256 private initBlock;
    uint256 private initialPrice;
    bool public auctionStatusOpen;

    /**
    * @param erc721TokenAddress - price slash block by block
    * @param _nftTokenId - price slash block by block
    * @param _reservePrice - the base price till which seller will accept bids
    * @param _numBlocksAuctionOpen - number of blocks after which this contract will expire
    * @param _offerPriceDecrement - price slash block by block
    */
    constructor(address erc721TokenAddress,
        uint256 _nftTokenId, uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement){

        seller = payable(msg.sender);
        initBlock = block.number;
        auctionStatusOpen = true;

        // nftAddress = erc721TokenAddress;
        nftId = _nftTokenId;
        nftAddress = IUniqueNFT(erc721TokenAddress);

        //check if seller is the owner of nftAddress
        require(nftAddress.ownerOf(nftId) == seller,"You don't own this NFT to sell");

        //assigning local variables to state variables
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;

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

    //@return the Auction Status
    function isAuctionOpen() view private returns(bool){
        return blockDifference() <= numBlocksAuctionOpen;
    }

    //finalizing the auction status
    function finalize() private{
        nftAddress.transferFrom(seller, msg.sender , nftId);
        buyer = nftAddress.ownerOf(nftId);
        auctionStatusOpen = false;
    }

    //@param excessAmount - excess amount sent by buyer
    function refund(uint excessAmount) private{
        payable(msg.sender).transfer(excessAmount);
    }

    /**
     * @notice A function that accept bids from any externally owned accounts(EOA)
     * check if the product is already bought if yes then revert the payment
     * check if the Auction is still open for the current block number
     * check if the amount sent by bidder is equal to current price
     * make a transfer to seller or revert the transaction if fails
    */
    function bid() public payable {

        //checking the block limit set by the seller to see if Auction is still open
        require(isAuctionOpen(), "Auction is closed");

        //checking if buyer is bidding again
        require(msg.sender != buyer, "You already bought this product");

        //checking if product is available in the market
        require(buyer == address(0), "Product already sold");

        //checking if Bidder is owner of the contract
        require(msg.sender != seller, "Owner can't Bid");

        //condition to check if bidder sent the right amount that matches the current price of the item sold
        require(msg.value >= currentPrice(),"WEI is insufficient");

        //transferring the amount to seller
        (bool tryToSend, ) = seller.call{ value: currentPrice() }("");
        require(tryToSend == true, "failed to send");

        // refund the excess amount if excess amount is sent
        uint256 excess = msg.value - currentPrice();

        if(excess > 0){
            refund(excess);
        }

        //finalizing the auction
        finalize();

    }

}