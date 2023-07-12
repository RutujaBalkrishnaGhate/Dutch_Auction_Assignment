/**
* @title NFTDutchAuction_ERC20Bids Smart Contract
* @author Rutuja Balkrishna Ghate
*/

//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract UniqNFT is ERC721, Ownable{

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // state variables maintaining the maximum Supply of NFT's and current supply in the market
    uint public currentSupply;
    uint public maxSupply;

    // @param max: initializing with a limited total supply of NFT's
    constructor(uint max) ERC721("UNIQ NFT", "UN"){
        maxSupply = max;
    }

    // @param to: address to which NFT should be minted
    function safeMint(address to) public onlyOwner{
        // checking if maximum num. of NFT's are Minted
        require(maxSupply > currentSupply,"already minted max");

        // incrementing the _tokenId for mint
        _tokenIds.increment();

        // using _mint from ERC721 to handle the mint
        _mint(to,_tokenIds.current());
        currentSupply++;
    }

}