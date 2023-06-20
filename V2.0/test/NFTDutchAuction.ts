import { loadFixture, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Minting & Auctioning NFT", function () {
    async function deployNFTDutchAuctionFixture() {

        const [owner, otherAccount, otherAccount2] = await ethers.getSigners();

        const UniqNFTFactory = await ethers.getContractFactory("UniqNFT");
        const uniqNFTFactory = await UniqNFTFactory.connect(owner).deploy(10);

        await uniqNFTFactory.safeMint(owner.address);

        const NFTDutchAuctionFactory = await ethers.getContractFactory("NFTDutchAuction");
        const nftDutchAuction = await NFTDutchAuctionFactory.deploy(uniqNFTFactory.address, 1, 100, 10, 10);

        await uniqNFTFactory.approve(nftDutchAuction.address, 1);

        return {uniqNFTFactory, nftDutchAuction, owner, otherAccount, otherAccount2};
    }

    describe("UniqNFT & Dutch Auction Deployment", function () {
        it("Safe Mint NFT", async function () {
            const {uniqNFTFactory, owner} = await loadFixture(deployNFTDutchAuctionFixture);
            expect(await uniqNFTFactory.safeMint(owner.address));
            expect(await uniqNFTFactory.balanceOf(owner.address)).to.equal(2);
            expect(await uniqNFTFactory.ownerOf(2)).to.equal(owner.address);
        });

        it("Malicious Mint failure", async function () {
            const { uniqNFTFactory, otherAccount } = await loadFixture(deployNFTDutchAuctionFixture);
            await expect(uniqNFTFactory.connect(otherAccount).safeMint(otherAccount.address)).to.be.revertedWith( "Ownable: caller is not the owner");
        });

        it('Check seller is owner', async function () {

            const { nftDutchAuction, owner} = await loadFixture(deployNFTDutchAuctionFixture);
            expect(await nftDutchAuction.seller()).to.equal(owner.address);

        });

        it("Seller can't Bid", async function () {

            const { nftDutchAuction, owner} = await loadFixture(deployNFTDutchAuctionFixture);
            await expect(nftDutchAuction.connect(owner).bid({value:200})).to.be.revertedWith("Owner can't Bid");

        });

        it("Product is still available for bid", async function () {
            const { nftDutchAuction} = await loadFixture(deployNFTDutchAuctionFixture);

            expect(await nftDutchAuction.buyer()).to.equal(ethers.constants.AddressZero);

        });

        it("Auction Status is Open", async function () {
            const { nftDutchAuction} = await loadFixture(deployNFTDutchAuctionFixture);

            expect(await nftDutchAuction.auctionStatusOpen()).to.equal(true);

        });


        it("Number of rounds", async function () {
            const { nftDutchAuction} = await loadFixture(deployNFTDutchAuctionFixture);
            const hashOfTx = nftDutchAuction.deployTransaction.hash;
            const initBlock = (await nftDutchAuction.provider.getTransactionReceipt(hashOfTx)).blockNumber;
            const currentBlock = await ethers.provider.getBlockNumber();
            expect(10).to.greaterThanOrEqual(currentBlock-initBlock);

        });

        it("Wei is insufficient", async function () {
            const { nftDutchAuction, otherAccount} = await loadFixture(deployNFTDutchAuctionFixture);

            expect( nftDutchAuction.connect(otherAccount).bid({value:10})).to.be.revertedWith("WEI is insufficient");

        });


        it("Successful Bid and wallet balance checks", async function () {
            const { uniqNFTFactory, nftDutchAuction, owner, otherAccount } = await loadFixture(deployNFTDutchAuctionFixture);

            expect(await uniqNFTFactory.balanceOf(owner.address)).to.equal(1);

            expect(await nftDutchAuction.connect(otherAccount).bid({value: 1000}));

            expect(await uniqNFTFactory.balanceOf(owner.address)).to.equal(0);
            expect(await uniqNFTFactory.balanceOf(otherAccount.address)).to.equal(1);

            expect(await nftDutchAuction.connect(owner).buyer()).to.equal(otherAccount.address);

            expect(await nftDutchAuction.auctionStatusOpen()).to.equal(false)

        });


        it("You already bought this product", async function () {
            const { nftDutchAuction, otherAccount } = await loadFixture(deployNFTDutchAuctionFixture);

            expect(await nftDutchAuction.connect(otherAccount).bid({value:1000})).to.be.revertedWith("You already bought this product");

        });

        it("failure Bid as item is already sold", async function () {
            const { nftDutchAuction, otherAccount2 } = await loadFixture(deployNFTDutchAuctionFixture);

            expect(await nftDutchAuction.connect(otherAccount2).bid({value: 100000})).to.be.revertedWith("Product already sold");
        });

        it("Block passed - Auction closed", async function () {
            const { nftDutchAuction, otherAccount } = await loadFixture(deployNFTDutchAuctionFixture);

            await mine(100);

            expect( nftDutchAuction.connect(otherAccount).bid({value:10})).to.be.revertedWith("Auction is closed");

        });

    });
});