import { loadFixture, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import {ethers, upgrades} from "hardhat";
import {BigNumber, constants} from "ethers";
import { UniqToken } from '../typechain-types'

async function getPermitSignature(signer:any, token:UniqToken, spender:string, value:BigNumber, deadline:BigNumber) {

    const [nonce, name, version, chainId] = await Promise.all([
        token.nonces(signer.address),
        token.name(),
        "1",
        signer.getChainId(),
    ])

    return ethers.utils.splitSignature(
        await signer._signTypedData(
            {
                name,
                version,
                chainId,
                verifyingContract: token.address,
            },
            {
                Permit: [
                    {
                        name: "owner",
                        type: "address",
                    },
                    {
                        name: "spender",
                        type: "address",
                    },
                    {
                        name: "value",
                        type: "uint256",
                    },
                    {
                        name: "nonce",
                        type: "uint256",
                    },
                    {
                        name: "deadline",
                        type: "uint256",
                    },
                ],
            },
            {
                owner: signer.address,
                spender,
                value,
                nonce,
                deadline,
            }
        )
    )
}

describe("Minting & Auctioning NFT with ERC20", function () {
    async function deployNFTDutchAuctionERC20BidsUpgradeableFixture() {

        const [owner, otherAccount, otherAccount2] = await ethers.getSigners();

        const UniqNFTFactory = await ethers.getContractFactory("UniqNFT");
        const uniqNFTFactory = await UniqNFTFactory.deploy(10);

        await uniqNFTFactory.safeMint(owner.address);

        const UniqTokenFactory = await ethers.getContractFactory("UniqToken");
        const uniqTokenFactory = await UniqTokenFactory.deploy(10000);

        await uniqTokenFactory.connect(otherAccount).buy(300,{value: 30000});

        const UpgradeableNFTDutchAuctionFactory = await ethers.getContractFactory("NFTDutchAuction_ERC20BidsUpgradeable");
        const nftDutchAuction = await upgrades.deployProxy(UpgradeableNFTDutchAuctionFactory,[uniqTokenFactory.address, uniqNFTFactory.address, 1, 100, 10, 10],{kind : 'uups'});

        await uniqNFTFactory.approve(nftDutchAuction.address, 1);
        // await uniqTokenFactory.connect(otherAccount).approve(nftDutchAuction.address, 300);

        return {uniqNFTFactory, uniqTokenFactory, nftDutchAuction, owner, otherAccount, otherAccount2};
    }

    describe("UniqNFT & Dutch Auction Deployment with ERC20 Permit functionality ", function () {

        it("Safe Mint NFT", async function () {
            const {uniqNFTFactory, owner} = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);

            expect(await uniqNFTFactory.safeMint(owner.address));
            expect(await uniqNFTFactory.balanceOf(owner.address)).to.equal(2);
            expect(await uniqNFTFactory.ownerOf(2)).to.equal(owner.address);
        });

        it("Malicious Mint failure", async function () {
            const { uniqNFTFactory, otherAccount } = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);

            await expect(uniqNFTFactory.connect(otherAccount).safeMint(otherAccount.address)).to.be.revertedWith( "Ownable: caller is not the owner");
        });

        it("check NFT supply", async function () {
            const {uniqNFTFactory} = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);

            expect(await uniqNFTFactory.maxSupply()).to.equal(10);
            expect(await uniqNFTFactory.currentSupply()).to.equal(1);

        });

        it("check token supply", async function () {
            const {uniqTokenFactory} = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);

            expect(await uniqTokenFactory.maxSupply()).to.equal(10000);
            expect(await uniqTokenFactory.totalSupply()).to.equal(300);

        });

        it("check token price", async function () {
            const {uniqTokenFactory} = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);

            expect(await uniqTokenFactory.currentPrice()).to.equal(100);

        });

        it("token Balance Check", async function () {
            const {uniqTokenFactory, otherAccount} = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);

            expect(await uniqTokenFactory.balanceOf(otherAccount.address)).to.equal(300);

        });

        it("token Allowance Check", async function () {
            const {uniqTokenFactory, nftDutchAuction, otherAccount} = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);

            const deadline = ethers.constants.MaxUint256

            const { v, r, s } = await getPermitSignature(
                otherAccount,
                uniqTokenFactory,
                nftDutchAuction.address,
                await uniqTokenFactory.balanceOf(otherAccount.address),
                deadline
            )

            await uniqTokenFactory.permit(
                otherAccount.address,
                nftDutchAuction.address,
                uniqTokenFactory.balanceOf(otherAccount.address),
                deadline,
                v,r,s
            )

            expect(await uniqTokenFactory.allowance(otherAccount.address,nftDutchAuction.address)).to.equal(await uniqTokenFactory.balanceOf(otherAccount.address));

        });

        it('Check seller is owner', async function () {

            const { nftDutchAuction, owner} = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);
            expect(await nftDutchAuction.seller()).to.equal(owner.address);

        });

        it("Seller can't Bid", async function () {

            const { nftDutchAuction, owner} = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);
            await expect(nftDutchAuction.connect(owner).bid(200)).to.be.revertedWith("Owner can't Bid");

        });

        it("Product is still available for bid", async function () {
            const { nftDutchAuction} = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);

            expect(await nftDutchAuction.buyer()).to.equal(ethers.constants.AddressZero);

        });

        it("Auction Status is Open", async function () {
            const { nftDutchAuction} = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);

            expect(await nftDutchAuction.auctionStatusOpen()).to.equal(true);

        });


        it("Number of rounds", async function () {
            const { nftDutchAuction} = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);
            const hashOfTx = nftDutchAuction.deployTransaction.hash;
            const initBlock = (await nftDutchAuction.provider.getTransactionReceipt(hashOfTx)).blockNumber;
            const currentBlock = await ethers.provider.getBlockNumber();
            expect(10).to.greaterThanOrEqual(currentBlock-initBlock);

        });

        it("Wei is insufficient", async function () {
            const { nftDutchAuction, otherAccount} = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);

            expect( nftDutchAuction.connect(otherAccount).bid(10)).to.be.revertedWith("WEI is insufficient");

        });

        it("Successful Bid and balance checks", async function () {
            const { uniqNFTFactory, uniqTokenFactory, nftDutchAuction, owner, otherAccount } = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);

            expect(await uniqNFTFactory.balanceOf(owner.address)).to.equal(1);
            expect(await uniqNFTFactory.balanceOf(otherAccount.address)).to.equal(0);

             expect(await uniqTokenFactory.balanceOf(owner.address)).to.equal(0);
             expect(await uniqTokenFactory.balanceOf(otherAccount.address)).to.equal(300);

            const deadline = ethers.constants.MaxUint256

            const { v, r, s } = await getPermitSignature(
                otherAccount,
                uniqTokenFactory,
                nftDutchAuction.address,
                await uniqTokenFactory.balanceOf(otherAccount.address),
                deadline
            )

            await uniqTokenFactory.permit(
                otherAccount.address,
                nftDutchAuction.address,
                uniqTokenFactory.balanceOf(otherAccount.address),
                deadline,
                v,r,s
            )

            expect(await nftDutchAuction.connect(otherAccount).bid(200));

            expect(await uniqNFTFactory.balanceOf(otherAccount.address)).to.equal(1);
            expect(await uniqNFTFactory.balanceOf(owner.address)).to.equal(0);

            expect(await nftDutchAuction.buyer()).to.equal(otherAccount.address);

            expect(await nftDutchAuction.auctionStatusOpen()).to.equal(false)
            expect(await uniqTokenFactory.balanceOf(otherAccount.address)).to.equal(140);
            expect(await uniqTokenFactory.balanceOf(owner.address)).to.equal(160);

        });

        it("You already bought this product", async function () {
            const { nftDutchAuction,uniqTokenFactory, otherAccount } = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);

            const deadline = ethers.constants.MaxUint256

            const { v, r, s } = await getPermitSignature(
                otherAccount,
                uniqTokenFactory,
                nftDutchAuction.address,
                await uniqTokenFactory.balanceOf(otherAccount.address),
                deadline
            )

            await uniqTokenFactory.permit(
                otherAccount.address,
                nftDutchAuction.address,
                uniqTokenFactory.balanceOf(otherAccount.address),
                deadline,
                v,r,s
            )

            expect(await nftDutchAuction.connect(otherAccount).bid(200)).to.be.revertedWith("You already bought this product");

        });

        it("Block passed - Auction closed", async function () {
            const { nftDutchAuction, otherAccount } = await loadFixture(deployNFTDutchAuctionERC20BidsUpgradeableFixture);

            await mine(100);

            expect( nftDutchAuction.connect(otherAccount).bid(10)).to.be.revertedWith("Auction is closed");

        });

    });
});