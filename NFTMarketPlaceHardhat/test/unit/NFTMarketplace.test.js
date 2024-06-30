const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const assert = require("assert")
const { expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFTMarketplace", () => {
        let nftmarketplace, basicnft, deployer, user
        const PRICE = ethers.parseEther("0.1")
        const TOKEN_ID = 0

        beforeEach(async () => {
            const accounts = await ethers.getSigners()
            deployer = accounts[0]
            user = accounts[1]

            await deployments.fixture(["all"])
            const marketplaceDeployment = await deployments.get("NFTMarketplace")
            nftmarketplace = await ethers.getContractAt("NFTMarketplace", marketplaceDeployment.address)

            const basicnftDeployment = await deployments.get("BasicNft")
            basicnft = await ethers.getContractAt("BasicNft", basicnftDeployment.address)

            await basicnft.mintNft()
            await basicnft.approve(nftmarketplace.target, TOKEN_ID)
        })

        describe("listItem", () => {
            it("Lists item successfully and emits an event", async () => {
                await expect(nftmarketplace.listItem(basicnft.target, TOKEN_ID, PRICE)).to.emit(nftmarketplace, "ItemListed")
            })
            it("Reverts if already listed", async () => {
                await nftmarketplace.listItem(basicnft.target, TOKEN_ID, PRICE)
                try {
                    await nftmarketplace.listItem(basicnft.target, TOKEN_ID, PRICE)
                    assert.fail("Expected listItem to revert")
                } catch (error) {
                    assert(error.message.includes("NFTMarketplace_AlreadyListed"), `Expected revert reason ${error.message}`);
                }
            })
            it("Reverts if lister is not owner", async () => {
                try {
                    await nftmarketplace.connect(user).listItem(basicnft.target, TOKEN_ID, PRICE)
                    assert.fail("Expected listItem to revert")
                } catch (error) {
                    assert(error.message.includes("NFTMarketplace_NotOwner"), `Expected revert reason ${error.message}`);
                }
            })
            it("Reverts if NFT is not approved", async () => {
                const ADDRESS = "0x0000000000000000000000000000000000000000"
                // Override nft approval
                await basicnft.approve(ADDRESS, TOKEN_ID)
                try {
                    await nftmarketplace.listItem(basicnft.target, TOKEN_ID, PRICE)
                    assert.fail("Expected listItem to revert")
                } catch (error) {
                    assert(error.message.includes("NFTMarketplace_NotApprovedForMarketplace"), `Expected revert reason ${error.message}`);
                }
            })
            it("Reverts if price is zero", async () => {
                const ZERO_PRICE = ethers.parseEther("0")
                try {
                    await nftmarketplace.listItem(basicnft.target, TOKEN_ID, ZERO_PRICE)
                    assert.fail("Expected listItem to revert")
                } catch (error) {
                    assert(error.message.includes("NFTMarketplace_PriceMustBeAboveZero"), `Expected revert reason ${error.message}`);
                }
            })
            it("Updates listing with price and seller", async () => {
                await nftmarketplace.listItem(basicnft.target, TOKEN_ID, PRICE)
                const listing = await nftmarketplace.getListing(basicnft.target, TOKEN_ID)
                assert.equal(listing.price, PRICE)
                assert.equal(listing.seller, deployer.address)
            })
        })

        describe("BuyItem", () => {
            it("Reverts if item is not listed", async () => {
                try {
                    await nftmarketplace.buyItem(basicnft.target, 1, {value: PRICE})
                    assert.fail("Expected buyItem to revert")
                } catch (error) {
                    assert(error.message.includes("NFTMarketplace_NotListed"), `Expected revert reason ${error.message}`);
                }
            })
            it("Reverts if enough fund is not sent", async () => {
                await nftmarketplace.listItem(basicnft.target, TOKEN_ID, PRICE)
                try {
                    await nftmarketplace.buyItem(basicnft.target, TOKEN_ID, {value: ethers.parseEther("0.001")})
                    assert.fail("Expected buyItem to revert")
                } catch (error) {
                    assert(error.message.includes("NFTMarketplace_PriceNotMet"), `Expected revert reason ${error.message}`);
                }
            })
            it("Emits event when buy successfull, transfer nft to buyer, update proceeds and update listing", async () => {
                await nftmarketplace.listItem(basicnft.target, TOKEN_ID, PRICE)
                await expect(nftmarketplace.connect(user).buyItem(basicnft.target, TOKEN_ID, {value: PRICE})).to.emit(nftmarketplace, "NFTBought")

                const newOwner = await basicnft.ownerOf(TOKEN_ID)
                assert.equal(newOwner, user.address)

                const withdrawProceeds = await nftmarketplace.getProceeds(deployer.address)
                assert.equal(withdrawProceeds, PRICE)

                const listing = await nftmarketplace.getListing(basicnft.target, TOKEN_ID)
                assert.equal(listing.price, 0)
                assert.equal(listing.seller, "0x0000000000000000000000000000000000000000")
            })
        })

        describe("cancelListing", () => {
            it("Reverts if not owner", async () => {
                await nftmarketplace.listItem(basicnft.target, TOKEN_ID, PRICE)
                try {
                    await nftmarketplace.connect(user).cancelListing(basicnft.target, TOKEN_ID)
                    assert.fail("Expected buyItem to revert")
                } catch (error) {
                    assert(error.message.includes("NFTMarketplace_NotOwner"), `Expected revert reason ${error.message}`);
                }
            })
            it("Reverts if item is not listed", async () => {
                try {
                    await nftmarketplace.cancelListing(basicnft.target, TOKEN_ID)
                    assert.fail("Expected buyItem to revert")
                } catch (error) {
                    assert(error.message.includes("NFTMarketplace_NotListed"), `Expected revert reason ${error.message}`);
                }
            })
            it("Emits event and deletes listing after success", async () => {
                await nftmarketplace.listItem(basicnft.target, TOKEN_ID, PRICE)
                await expect(nftmarketplace.cancelListing(basicnft.target, TOKEN_ID)).to.emit(nftmarketplace, "ItemCanceled")
                const listing = await nftmarketplace.getListing(basicnft.target, TOKEN_ID)
                assert.equal(listing.price, 0)
                assert.equal(listing.seller, "0x0000000000000000000000000000000000000000")
            })
        })

        describe("updateListing", () => {
            it("Reverts if not owner", async () => {
                await nftmarketplace.listItem(basicnft.target, TOKEN_ID, PRICE)
                try {
                    await nftmarketplace.connect(user).updateListing(basicnft.target, TOKEN_ID, PRICE)
                    assert.fail("Expected buyItem to revert")
                } catch (error) {
                    assert(error.message.includes("NFTMarketplace_NotOwner"), `Expected revert reason ${error.message}`);
                }
            })
            it("Reverts if not listed", async () => {
                try {
                    await nftmarketplace.updateListing(basicnft.target, TOKEN_ID, PRICE)
                    assert.fail("Expected buyItem to revert")
                } catch (error) {
                    assert(error.message.includes("NFTMarketplace_NotListed"), `Expected revert reason ${error.message}`);
                }
            })
            it("Reverts if price is zero", async () => {
                await nftmarketplace.listItem(basicnft.target, TOKEN_ID, PRICE)
                try {
                    await nftmarketplace.updateListing(basicnft.target, TOKEN_ID, ethers.parseEther("0.0"))
                    assert.fail("Expected buyItem to revert")
                } catch (error) {
                    assert(error.message.includes("NFTMarketplace_PriceMustBeAboveZero"), `Expected revert reason ${error.message}`);
                }
            })
            it("update price of item and emits event", async () => {
                await nftmarketplace.listItem(basicnft.target, TOKEN_ID, PRICE)
                await expect(nftmarketplace.updateListing(basicnft.target, TOKEN_ID, ethers.parseEther("0.05"))).to.emit(nftmarketplace, "ItemListed")
                const listing = await nftmarketplace.getListing(basicnft.target, TOKEN_ID)
                assert.equal(listing.price, ethers.parseEther("0.05"))
            })
        })

        describe("withdrawProceeds", () => {
            it("Reverts if proceeds is zero", async () => {
                try {
                    await nftmarketplace.withdrawproceeds()
                    assert.fail("Expected buyItem to revert")
                } catch (error) {
                    assert(error.message.includes("NFTMarketplace_NoProceeds"), `Expected revert reason ${error.message}`);
                }
            })
            it("withdraws proceed", async () => {
                await nftmarketplace.listItem(basicnft.target, TOKEN_ID, PRICE)
                await nftmarketplace.connect(user).buyItem(basicnft.target, TOKEN_ID, {value: PRICE})

                const deployerProceedsBefore = await nftmarketplace.getProceeds(deployer.address)
                const deployerBalanceBefore = await ethers.provider.getBalance(deployer)
                const tx = await nftmarketplace.connect(deployer).withdrawproceeds()
                const txReceipt = await tx.wait(1)
                const { gasUsed, gasPrice } = txReceipt
                const gasCost = gasPrice * gasUsed
                const deployerBalanceAfter = await ethers.provider.getBalance(deployer)

                assert.equal(deployerBalanceAfter + gasCost, deployerBalanceBefore + deployerProceedsBefore)
            })
        })
    })