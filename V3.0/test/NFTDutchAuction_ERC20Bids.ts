import { loadFixture, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Minting & Auctioning NFT with ERC20", function () {
    async function deployNFTDutchAuctionERC20Fixture() {

        const [owner, otherAccount, otherAccount2] = await ethers.getSigners();

        const UniqNFTFactory = await ethers.getContractFactory("UniqNFT");
        const uniqNFTFactory = await UniqNFTFactory.connect(owner).deploy(10);

        await uniqNFTFactory.safeMint(owner.address);

        const UniqTokenFactory = await ethers.getContractFactory("UniqToken");
        const uniqTokenFactory = await UniqTokenFactory.connect(owner).deploy(10000);

        await uniqTokenFactory.connect(otherAccount).buy(300,{value: 30000});

        const NFTDutchAuctionFactory = await ethers.getContractFactory("NFTDutchAuction_ERC20Bids");
        const nftDutchAuction = await NFTDutchAuctionFactory.deploy(uniqTokenFactory.address, uniqNFTFactory.address, 1, 100, 10, 10);

        await uniqNFTFactory.approve(nftDutchAuction.address, 1);
        await uniqTokenFactory.connect(otherAccount).approve(nftDutchAuction.address, 300);

        return {uniqNFTFactory, uniqTokenFactory, nftDutchAuction, owner, otherAccount, otherAccount2};
    }

    describe("UniqNFT & Dutch Auction Deployment", function () {
        it("Safe Mint NFT", async function () {
            const {uniqNFTFactory, owner} = await loadFixture(deployNFTDutchAuctionERC20Fixture);

            expect(await uniqNFTFactory.safeMint(owner.address));
            expect(await uniqNFTFactory.balanceOf(owner.address)).to.equal(2);
            expect(await uniqNFTFactory.ownerOf(2)).to.equal(owner.address);
        });

        it("Malicious Mint failure", async function () {
            const { uniqNFTFactory, otherAccount } = await loadFixture(deployNFTDutchAuctionERC20Fixture);

            await expect(uniqNFTFactory.connect(otherAccount).safeMint(otherAccount.address)).to.be.revertedWith( "Ownable: caller is not the owner");
        });

        it("check NFT supply", async function () {
            const {uniqNFTFactory} = await loadFixture(deployNFTDutchAuctionERC20Fixture);

            expect(await uniqNFTFactory.maxSupply()).to.equal(10);
            expect(await uniqNFTFactory.currentSupply()).to.equal(1);

        });

        it("check token supply", async function () {
            const {uniqTokenFactory} = await loadFixture(deployNFTDutchAuctionERC20Fixture);

            expect(await uniqTokenFactory.maxSupply()).to.equal(10000);
            expect(await uniqTokenFactory.totalSupply()).to.equal(300);

        });

        it("check token price", async function () {
            const {uniqTokenFactory} = await loadFixture(deployNFTDutchAuctionERC20Fixture);

            expect(await uniqTokenFactory.currentPrice()).to.equal(100);

        });

        it("token Balance Check", async function () {
            const {uniqTokenFactory, otherAccount} = await loadFixture(deployNFTDutchAuctionERC20Fixture);

            expect(await uniqTokenFactory.balanceOf(otherAccount.address)).to.equal(300);

        });

        it("token Allowance Check", async function () {
            const {uniqTokenFactory, nftDutchAuction, otherAccount} = await loadFixture(deployNFTDutchAuctionERC20Fixture);

            expect(await uniqTokenFactory.allowance(otherAccount.address,nftDutchAuction.address)).to.equal(300);

        });

        it('Check seller is owner', async function () {

            const { nftDutchAuction, owner} = await loadFixture(deployNFTDutchAuctionERC20Fixture);
            expect(await nftDutchAuction.seller()).to.equal(owner.address);

        });

        it("Seller can't Bid", async function () {

            const { nftDutchAuction, owner} = await loadFixture(deployNFTDutchAuctionERC20Fixture);
            await expect(nftDutchAuction.connect(owner).bid(200)).to.be.revertedWith("Owner can't Bid");

        });

        it("Product is still available for bid", async function () {
            const { nftDutchAuction} = await loadFixture(deployNFTDutchAuctionERC20Fixture);

            expect(await nftDutchAuction.buyer()).to.equal(ethers.constants.AddressZero);

        });

        it("Auction Status is Open", async function () {
            const { nftDutchAuction} = await loadFixture(deployNFTDutchAuctionERC20Fixture);

            expect(await nftDutchAuction.auctionStatusOpen()).to.equal(true);

        });


        it("Number of rounds", async function () {
            const { nftDutchAuction} = await loadFixture(deployNFTDutchAuctionERC20Fixture);
            const hashOfTx = nftDutchAuction.deployTransaction.hash;
            const initBlock = (await nftDutchAuction.provider.getTransactionReceipt(hashOfTx)).blockNumber;
            const currentBlock = await ethers.provider.getBlockNumber();
            expect(10).to.greaterThanOrEqual(currentBlock-initBlock);

        });

        it("Wei is insufficient", async function () {
            const { nftDutchAuction, otherAccount} = await loadFixture(deployNFTDutchAuctionERC20Fixture);

            expect( nftDutchAuction.connect(otherAccount).bid(10)).to.be.revertedWith("WEI is insufficient");

        });

        it("Successful Bid and balance checks", async function () {
            const { uniqNFTFactory, uniqTokenFactory, nftDutchAuction, owner, otherAccount } = await loadFixture(deployNFTDutchAuctionERC20Fixture);

            expect(await uniqNFTFactory.balanceOf(owner.address)).to.equal(1);
            expect(await uniqNFTFactory.balanceOf(otherAccount.address)).to.equal(0);

             expect(await uniqTokenFactory.balanceOf(owner.address)).to.equal(0);
             expect(await uniqTokenFactory.balanceOf(otherAccount.address)).to.equal(300);

            expect(await nftDutchAuction.connect(otherAccount).bid(200));

            expect(await uniqNFTFactory.balanceOf(otherAccount.address)).to.equal(1);
            expect(await uniqNFTFactory.balanceOf(owner.address)).to.equal(0);

            expect(await nftDutchAuction.buyer()).to.equal(otherAccount.address);

            expect(await nftDutchAuction.auctionStatusOpen()).to.equal(false)
            expect(await uniqTokenFactory.balanceOf(otherAccount.address)).to.equal(140);
            expect(await uniqTokenFactory.balanceOf(owner.address)).to.equal(160);

        });

        it("You already bought this product", async function () {
            const { nftDutchAuction, otherAccount } = await loadFixture(deployNFTDutchAuctionERC20Fixture);

            expect(await nftDutchAuction.connect(otherAccount).bid(200)).to.be.revertedWith("You already bought this product");

        });

        it("Block passed - Auction closed", async function () {
            const { nftDutchAuction, otherAccount } = await loadFixture(deployNFTDutchAuctionERC20Fixture);

            await mine(100);

            expect( nftDutchAuction.connect(otherAccount).bid(10)).to.be.revertedWith("Auction is closed");

        });

    });
});