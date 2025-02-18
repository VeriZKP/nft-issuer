// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC5727SBT is Ownable {
    struct Token {
        address owner;
        uint256 tokenId;
        uint256 slot;
        bool revoked;
        string metadataURI;
    }

    mapping(uint256 => Token) private _tokens;
    mapping(address => uint256[]) private _ownedTokens;
    uint256[] private _allTokens;

    uint256 private _tokenCounter;

    event Issued(address indexed to, uint256 indexed tokenId);
    event Revoked(address indexed from, uint256 indexed tokenId);
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    constructor() Ownable(msg.sender) {}

    //Issue a Soulbound Token (SBT) to an address.
    function issue(
        address to,
        uint256 slot,
        string memory metadataURI
    ) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");

        uint256 tokenId = ++_tokenCounter;
        _tokens[tokenId] = Token(to, tokenId, slot, false, metadataURI);
        _ownedTokens[to].push(tokenId);
        _allTokens.push(tokenId);

        emit Issued(to, tokenId);
        emit Transfer(address(0), to, tokenId);
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

    //Get the owner of a token.
    function ownerOf(uint256 tokenId) external view returns (address) {
        require(_tokens[tokenId].owner != address(0), "Token does not exist");
        if (_tokens[tokenId].revoked) {
            return address(0);
        }
        return _tokens[tokenId].owner;
    }

    //Get the tokens owned by an address.
    function tokensOfOwner(
        address owner
    ) external view returns (uint256[] memory) {
        uint256[] memory allTokens = _ownedTokens[owner];
        uint256 validCount = 0;

        for (uint256 i = 0; i < allTokens.length; i++) {
            if (!_tokens[allTokens[i]].revoked) {
                validCount++;
            }
        }

        uint256[] memory activeTokens = new uint256[](validCount);
        uint256 index = 0;

        for (uint256 i = 0; i < allTokens.length; i++) {
            if (!_tokens[allTokens[i]].revoked) {
                activeTokens[index] = allTokens[i];
                index++;
            }
        }
        return activeTokens;
    }

    // Get details of all issued tokens
    function getAllIssuedTokenDetails() external view returns (Token[] memory) {
        uint256 totalTokens = _allTokens.length;
        Token[] memory allDetails = new Token[](totalTokens);

        for (uint256 i = 0; i < totalTokens; i++) {
            uint256 tokenId = _allTokens[i];
            allDetails[i] = _tokens[tokenId];
        }
        return allDetails;
    }

    //Returns the metadata URI of a token.
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_tokens[tokenId].owner != address(0), "Token does not exist");
        return _tokens[tokenId].metadataURI; //Fetch metadataURI from stored token
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return
            interfaceId == 0x80ac58cd || // ERC-721 compatibility for OpenSea & MetaMask
            interfaceId == 0x00000000 || // Placeholder for ERC-5727
            interfaceId == 0x01ffc9a7; // ERC-165 support
    }
}
