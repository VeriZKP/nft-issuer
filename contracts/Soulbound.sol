// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC5727SBT is ERC721URIStorage, Ownable {
    struct Token {
        address owner;
        uint256 tokenId;
        uint256 slot;
        bool revoked;
        string metadataURI;
    }

    mapping(uint256 => Token) private _tokens;
    uint256 private _tokenCounter;

    event Issued(address indexed to, uint256 indexed tokenId);
    event Revoked(address indexed from, uint256 indexed tokenId);

    constructor() ERC721("SoulboundToken", "SBT") Ownable(msg.sender) {}

    //Issue a Soulbound Token (SBT) to an address.
    function issue(
        address to,
        uint256 slot,
        string memory metadataURI
    ) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");

        uint256 tokenId = ++_tokenCounter;
        _tokens[tokenId] = Token(to, tokenId, slot, false, metadataURI);

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit Issued(to, tokenId);
    }

    //Revoke a Soulbound Token (SBT).
    function revoke(uint256 tokenId) external onlyOwner {
        require(_tokens[tokenId].owner != address(0), "Token does not exist");
        require(!_tokens[tokenId].revoked, "Token already revoked");

        _tokens[tokenId].revoked = true;

        emit Revoked(_tokens[tokenId].owner, tokenId);
    }

    //Check if a token is revoked. Return True if revoked, false otherwise.
    function isRevoked(uint256 tokenId) external view returns (bool) {
        return _tokens[tokenId].revoked;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public pure override returns (bool) {
        return
            interfaceId == 0x80ac58cd || // ERC-721 compatibility for OpenSea & MetaMask
            interfaceId == 0x00000000 || // Placeholder for ERC-5727
            interfaceId == 0x01ffc9a7; // ERC-165 support
    }
}
