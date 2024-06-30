const {
    frontEndNetworkMappingFile,
    frontEndAbiLocation
} = require("../helper-hardhat-config")
require("dotenv").config()
const fs = require("fs")
const { network, deployments, ethers } = require("hardhat")
const path = require('path')

const FRONTEND_ADDRESSES_FILE = path.resolve(__dirname, frontEndNetworkMappingFile)
const FRONTEND_ABI_FILE = path.resolve(__dirname, frontEndAbiLocation)

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        //await updateContractAddresses()
        //await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const nftMarketplaceDeployment = await deployments.get("NFTMarketplace")
    fs.writeFileSync(
        path.join(FRONTEND_ABI_FILE, "NftMarketplace.json"),
        JSON.stringify(nftMarketplaceDeployment.abi, null, 2)
    )

    const basicnftDeployment = await deployments.get("BasicNft")
    fs.writeFileSync(
        path.join(FRONTEND_ABI_FILE, "BasicNft.json"),
        JSON.stringify(basicnftDeployment.abi, null, 2)
    )
}

async function updateContractAddresses() {
    const chainId = network.config.chainId.toString()
    const nftMarketplaceDeployment = await deployments.get("NFTMarketplace")
    const nftMarketplace = await ethers.getContractAt("NFTMarketplace", nftMarketplaceDeployment.address)
    const data = fs.existsSync(FRONTEND_ADDRESSES_FILE) ? fs.readFileSync(FRONTEND_ADDRESSES_FILE, "utf8") : "{}"
    const contractAddresses = data ? JSON.parse(data) : {};
    if (!contractAddresses[chainId]) {
        contractAddresses[chainId] = {"NftMarketplace": []}
    }
    if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.target)) {
        contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.target)
    }
    fs.writeFileSync(FRONTEND_ADDRESSES_FILE, JSON.stringify(contractAddresses, null, 2))
}
module.exports.tags = ["all", "frontend"]