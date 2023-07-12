/**
* @title NFTDutchAuction_ERC20Bids Smart Contract
* @author Rutuja Balkrishna Ghate
*/

/**
* Note
* Add an upgrade proxy to make your NFTDutchAuction_ERC20Bids.sol upgradeable. You don’t need to make the NFT or ERC20 contracts upgradeable. Just the DutchAuction contract.
* Read the documentation on upgradeable contracts
* Use the UUPS proxy instead of a transparent proxy: https://docs.openzeppelin.com/contracts/4.x/api/proxy
*/

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// Interface for Unique NFT(ERC721) contract
interface IUniqueNFT{
    function transferFrom(address _from, address _to, uint _nftId) external;
    function ownerOf(uint id) external view returns (address owner);
}

// Inteface for Uniq Token(ERC20) contract
interface IUniqueToken{
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract NFTDutchAuction_ERC20BidsUpgradeable is Initializable, UUPSUpgradeable, OwnableUpgradeable{

    uint256 nftId;
    IUniqueNFT nftAddress;
    IUniqueToken tokenAddress;

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
    * initialize function acts as constructor for upgradeable smart contracts
    * @param erc20TokenAddress - address of ERC20(Uniq Token) contract
    * @param erc721TokenAddress - address of ERC721(Uniq NFT) contract
    * @param _nftTokenId - price slash block by block
    * @param _reservePrice - the base price till which seller will accept bids
    * @param _numBlocksAuctionOpen - number of blocks after which this contract will expire
    * @param _offerPriceDecrement - price slash block by block
    */
    function initialize(address erc20TokenAddress, address erc721TokenAddress,
        uint256 _nftTokenId, uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement) public initializer{

        seller = payable(msg.sender);
        initBlock = block.number;
        auctionStatusOpen = true;

        // referencing the Parent contracts through interfaces
        nftId = _nftTokenId;
        nftAddress = IUniqueNFT(erc721TokenAddress);
        tokenAddress = IUniqueToken(erc20TokenAddress);

        //check if seller is the owner of nftAddress
        require(nftAddress.ownerOf(nftId) == seller,"You don't own this NFT to sell");

        //assigning local variables to state variables
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;

        //calculating the initial price based on reservePrice, numBlocksAuctionOpen, offerPriceDecrement
        initialPrice = reservePrice + (numBlocksAuctionOpen * offerPriceDecrement);

    }

    /** authorize the owner to upgrade the contract we implement
    * address: address of new version of contract
    */
    function _authorizeUpgrade(address) internal override onlyOwner {}

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

    /**
    * finalizing the auction status
    * @param addy: "address of buyer to transfer NFT
    */
    function finalize(address addy) private{
        nftAddress.transferFrom(seller, addy , nftId);
        buyer = nftAddress.ownerOf(nftId);
        auctionStatusOpen = false;
    }

    /**
     * @notice A function that accept bids from any externally owned accounts(EOA)
     * check if the product is already bought if yes then revert the payment
     * check if the Auction is still open for the current block number
     * check if the amount sent by bidder is equal to current price
     * make a transfer to seller or revert the transaction if fails
     *
     * @param amount : send the current price of NFT to bid
    */
    function bid(uint256 amount) public {

        //checking the block limit set by the seller to see if Auction is still open
        require(isAuctionOpen(), "Auction is closed");

        //checking if buyer is bidding again
        require(msg.sender != buyer, "You already bought this product");

        //checking if product is available in the market
        require(buyer == address(0), "Product already sold");

        //checking if Bidder is owner of the contract
        require(msg.sender != seller, "Owner can't Bid");

        //condition to check if bidder sent the right amount that matches the current price of the item sold
        require(amount >= currentPrice(),"WEI is insufficient");

        //try to transfer ERC20 tokens to seller/owner
        bool tryToSend = tokenAddress.transferFrom(msg.sender, seller, currentPrice());
        require(tryToSend == true, "failed to send");

        //finalizing the auction
        finalize(msg.sender);

    }
}
