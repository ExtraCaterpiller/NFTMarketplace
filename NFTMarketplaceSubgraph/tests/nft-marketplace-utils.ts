import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  ItemCanceled,
  ItemListed,
  NFTBought
} from "../generated/NFTMarketplace/NFTMarketplace"

export function createItemCanceledEvent(
  seller: Address,
  nftAddress: Address,
  tokenId: BigInt
): ItemCanceled {
  let itemCanceledEvent = changetype<ItemCanceled>(newMockEvent())

  itemCanceledEvent.parameters = new Array()

  itemCanceledEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  itemCanceledEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  )
  itemCanceledEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return itemCanceledEvent
}

export function createItemListedEvent(
  seller: Address,
  nftAddress: Address,
  tokenId: BigInt,
  price: BigInt
): ItemListed {
  let itemListedEvent = changetype<ItemListed>(newMockEvent())

  itemListedEvent.parameters = new Array()

  itemListedEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  itemListedEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  )
  itemListedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  itemListedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return itemListedEvent
}

export function createNFTBoughtEvent(
  buyer: Address,
  nftAddress: Address,
  tokenId: BigInt,
  price: BigInt
): NFTBought {
  let nftBoughtEvent = changetype<NFTBought>(newMockEvent())

  nftBoughtEvent.parameters = new Array()

  nftBoughtEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  nftBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  )
  nftBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  nftBoughtEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return nftBoughtEvent
}
