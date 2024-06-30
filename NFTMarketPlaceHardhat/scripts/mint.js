const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const PRICE = ethers.parseEther("0.1")

async function mintAndList() {
    const basicnftDeployment = await deployments.get("BasicNftTwo")
    const basicnft = await ethers.getContractAt("BasicNftTwo", basicnftDeployment.address)
    console.log("Minting NFT...")
    const mintTx = await basicnft.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    console.log(
        `Minted tokenId ${mintTxReceipt.logs[0].args.tokenId} from contract: ${
            basicnft.target
        }`
    )
    if (network.config.chainId == 31337) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })