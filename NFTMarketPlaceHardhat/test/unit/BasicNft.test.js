const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const assert = require("assert")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft", () => {
        let basicnft, deployer

        beforeEach(async () => {
            const accounts = await ethers.getSigners()
            deployer = accounts[0]

            await deployments.fixture(["all"])
            const basicnftDeployment = await deployments.get("BasicNft")
            basicnft = await ethers.getContractAt("BasicNft", basicnftDeployment.address)
        })

        describe("constructor", () => {
            it("Initializes the NFT Correctly.", async () => {
                const name = await basicnft.name()
                const symbol = await basicnft.symbol()
                const tokenCounter = await basicnft.getTokenCounter()
                assert.equal(name, "Dogie")
                assert.equal(symbol, "DOG")
                assert.equal(tokenCounter, 0)
            })
        })

        describe("mint NFT", () => {
            beforeEach(async () => {
                const txResponse = await basicnft.mintNft()
                await txResponse.wait(1)
            })

            it("Allows users to mint an NFT and updates appropriately", async function () {
                const tokenURI = await basicnft.tokenURI(0)
                const tokenCounter = await basicnft.getTokenCounter()

                assert.equal(tokenCounter, 1)
                assert.equal(tokenURI, await basicnft.TOKEN_URI())
            })
            it("Show the correct balance and owner of an NFT", async function () {
                const deployerAddress = deployer.address
                const deployerBalance = await basicnft.balanceOf(deployerAddress)
                const owner = await basicnft.ownerOf(0)

                assert.equal(deployerBalance.toString(), "1")
                assert.equal(owner, deployerAddress)
            })
        })
    })