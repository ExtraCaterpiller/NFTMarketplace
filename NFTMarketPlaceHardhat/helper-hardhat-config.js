const { ethers } = require("hardhat")

const networkConfig = {
    11155111: {
        name: "sepolia",
        vrfCoordinatorV2: process.env.SEPOLIA_VRF_COORDINATOR_ADDRESS,
        entranceFee: ethers.parseEther("0.005"),
        gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        subscriptionId: "41131926824872193487265923612433882623064248021734455407976990804978750134127",
        callbackGasLimit: "100000",
        interval: "30",
        keepersUpdateInterval: "30",
    },
    31337: {
        name: "localhost",
        entranceFee: ethers.parseEther("0.02"),
        gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        callbackGasLimit: "100000",
        interval: "30",
        keepersUpdateInterval: "30",
    },
    1: {
        name: "mainnet",
        keepersUpdateInterval: "30",
    },
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

const frontEndNetworkMappingFile = "../../nftmarketplacefrontend/constants/networkMapping.json"

const frontEndAbiLocation = "../../nftmarketplacefrontend/constants/"

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
    frontEndNetworkMappingFile,
    frontEndAbiLocation
}