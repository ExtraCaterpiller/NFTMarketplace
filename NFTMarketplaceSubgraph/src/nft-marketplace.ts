import { Address, BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts"
import {
  ItemCanceled as ItemCanceledEvent,
  ItemListed as ItemListedEvent,
  NFTBought as NFTBoughtEvent
} from "../generated/NFTMarketplace/NFTMarketplace"
import { ItemCanceled, ItemListed, NFTBought, ActiveItem } from "../generated/schema"

function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
  return tokenId.toHexString() + nftAddress.toHexString()
}

function getIDListedItemParams(tokenId: BigInt, hash: Bytes): string {
  let transactionHashHex = hash.toHexString().slice(2);
  let tokenIdHex = tokenId.toHexString().slice(2);
  return tokenIdHex+transactionHashHex
}

export function handleItemCanceled(event: ItemCanceledEvent): void {
  let entity = new ItemCanceled(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  )
  entity.seller = event.params.seller
  entity.nftAddress = event.params.nftAddress
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  )

  if(activeItem) {
    activeItem!.buyer = Address.fromString("0x000000000000000000000000000000000000dEaD")
    activeItem!.save()
  }
}

export function handleItemListed(event: ItemListedEvent): void {
  let entity = new ItemListed(
    getIDListedItemParams(event.params.tokenId, event.transaction.hash)
  )
  
  entity.seller = event.params.seller
  entity.nftAddress = event.params.nftAddress
  entity.tokenId = event.params.tokenId
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  )

  if(!activeItem) {
    activeItem = new ActiveItem(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  }

  activeItem.seller = event.params.seller
  activeItem.nftAddress = event.params.nftAddress
  activeItem.tokenId = event.params.tokenId
  activeItem.price = event.params.price
  activeItem.buyer = Address.fromString("0x0000000000000000000000000000000000000000")
  activeItem.save()
}

export function handleNFTBought(event: NFTBoughtEvent): void {
  let entity = new NFTBought(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  )
  entity.buyer = event.params.buyer
  entity.nftAddress = event.params.nftAddress
  entity.tokenId = event.params.tokenId
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  )

  if(activeItem) {
    activeItem!.buyer = event.params.buyer
    activeItem!.save()
  }
}
