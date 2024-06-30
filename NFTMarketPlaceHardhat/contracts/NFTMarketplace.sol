// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

error NFTMarketplace_PriceMustBeAboveZero();
error NFTMarketplace_NotApprovedForMarketplace();
error NFTMarketplace_AlreadyListed(address nftAddress, uint256 tokenId);
error NFTMarketplace_NotOwner();
error NFTMarketplace_NotListed(address nftAddress, uint256 tokenId);
error NFTMarketplace_PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
error NFTMarketplace_NoProceeds();
error NFTMarketplace_TransferFailed();

/** @notice A contract for NFT marketplace
 * @dev This contract allows users to list, sell and buy NFT and withdraw funds after selling NFTs
 */

contract NFTMarketplace is ReentrancyGuard {
    struct Listing {
        uint256 price;
        address seller;
    }

    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    event NFTBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    event ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;

    modifier notListed(address _nftAddress, uint256 _tokenId) {
        Listing memory listing = s_listings[_nftAddress][_tokenId];
        if (listing.price > 0) {
            revert NFTMarketplace_AlreadyListed(_nftAddress, _tokenId);
        }
        _;
    }

    modifier isOwner(
        address _nftAddress,
        uint256 _tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(_nftAddress);
        address owner = nft.ownerOf(_tokenId);
        if (spender != owner) {
            revert NFTMarketplace_NotOwner();
        }
        _;
    }

    modifier isListed(address _nftAddress, uint256 _tokenId) {
        Listing memory listing = s_listings[_nftAddress][_tokenId];
        if (listing.price <= 0) {
            revert NFTMarketplace_NotListed(_nftAddress, _tokenId);
        }
        _;
    }

    function listItem(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price
    )
        external
        notListed(_nftAddress, _tokenId)
        isOwner(_nftAddress, _tokenId, msg.sender)
    {
        if (_price <= 0) {
            revert NFTMarketplace_PriceMustBeAboveZero();
        }

        IERC721 nft = IERC721(_nftAddress);
        if (nft.getApproved(_tokenId) != address(this)) {
            revert NFTMarketplace_NotApprovedForMarketplace();
        }

        s_listings[_nftAddress][_tokenId] = Listing(_price, msg.sender);
        emit ItemListed(msg.sender, _nftAddress, _tokenId, _price);
    }

    function buyItem(
        address _nftAddress,
        uint256 _tokenId
    ) external payable nonReentrant isListed(_nftAddress, _tokenId) {
        Listing memory listedItem = s_listings[_nftAddress][_tokenId];
        if (msg.value < listedItem.price) {
            revert NFTMarketplace_PriceNotMet(
                _nftAddress,
                _tokenId,
                listedItem.price
            );
        }
        s_proceeds[listedItem.seller] += msg.value;
        delete (s_listings[_nftAddress][_tokenId]);
        IERC721(_nftAddress).safeTransferFrom(
            listedItem.seller,
            msg.sender,
            _tokenId
        );
        emit NFTBought(msg.sender, _nftAddress, _tokenId, listedItem.price);
    }

    function cancelListing(
        address _nftAddress,
        uint256 _tokenId
    )
        external
        isOwner(_nftAddress, _tokenId, msg.sender)
        isListed(_nftAddress, _tokenId)
    {
        delete (s_listings[_nftAddress][_tokenId]);
        emit ItemCanceled(msg.sender, _nftAddress, _tokenId);
    }

    function updateListing(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price
    )
        external
        isListed(_nftAddress, _tokenId)
        isOwner(_nftAddress, _tokenId, msg.sender)
    {
        if (_price <= 0) {
            revert NFTMarketplace_PriceMustBeAboveZero();
        }
        s_listings[_nftAddress][_tokenId].price = _price;
        emit ItemListed(msg.sender, _nftAddress, _tokenId, _price);
    }

    function withdrawproceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NFTMarketplace_NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NFTMarketplace_TransferFailed();
        }
    }

    function getListing(
        address _nftAddress,
        uint256 _tokenId
    ) external view returns (Listing memory) {
        return s_listings[_nftAddress][_tokenId];
    }

    function getProceeds(address _seller) external view returns (uint256) {
        return s_proceeds[_seller];
    }
}
