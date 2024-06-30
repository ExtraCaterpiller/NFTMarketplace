const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 1

async function cancel() {
    const nftMarketplaceDeployment = await deployments.get("NFTMarketplace")
    const nftMarketplace = await ethers.getContractAt("NFTMarketplace", nftMarketplaceDeployment.address)
    const basicnftDeployment = await deployments.get("BasicNft")
    const basicnft = await ethers.getContractAt("BasicNft", basicnftDeployment.address)

    const tx = await nftMarketplace.cancelListing(basicnft.target, TOKEN_ID)
    await tx.wait(1)
    console.log("NFT Canceled!")
    if ((network.config.chainId == "31337")) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

cancel()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })