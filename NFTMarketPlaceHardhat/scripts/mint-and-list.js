const { ethers } = require('hardhat')

const PRICE = ethers.parseEther("0.02")

const mintAndList = async () => {
    const nftMarketplaceDeployment = await deployments.get("NFTMarketplace")
    const nftMarketplace = await ethers.getContractAt("NFTMarketplace", nftMarketplaceDeployment.address)
    const basicnftDeployment = await deployments.get("BasicNft")
    const basicnft = await ethers.getContractAt("BasicNft", basicnftDeployment.address)

    console.log("Minting...")
    const mintTx = await basicnft.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.logs[0].args.tokenId

    console.log("Approving NFT...")
    const approvalTx = await basicnft.approve(nftMarketplace.target, tokenId)
    await approvalTx.wait(1)

    console.log("Listing NFT...")
    const listTx = await nftMarketplace.listItem(basicnft.target, tokenId, PRICE)
    const listTxReceipt = await listTx.wait(1)
    console.log("Listed!")
    console.log(`TokenId: ${listTxReceipt.logs[0].args.tokenId}, NFTAddress: ${listTxReceipt.logs[0].args.nftAddress}, seller: ${listTxReceipt.logs[0].args.seller}`)
}

mintAndList()
    .then(()=>process.exit(0))
    .catch((e)=>{
        console.log(e)
        process.exit(1)
    })