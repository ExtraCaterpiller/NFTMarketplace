const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 0

async function buyItem() {
    const nftMarketplaceDeployment = await deployments.get("NFTMarketplace")
    const nftMarketplace = await ethers.getContractAt("NFTMarketplace", nftMarketplaceDeployment.address)
    const basicnftDeployment = await deployments.get("BasicNft")
    const basicnft = await ethers.getContractAt("BasicNft", basicnftDeployment.address)

    const listing = await nftMarketplace.getListing(basicnft.target, TOKEN_ID)
    const price = listing.price.toString()

    const tx = await nftMarketplace.buyItem(basicnft.target, Number(TOKEN_ID), { value: price })
    await tx.wait(1)
    console.log("NFT Bought!")
    if ((network.config.chainId == "31337")) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

buyItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })