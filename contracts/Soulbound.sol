// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ERC5727SBT is ERC721URIStorage, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct Token {
        address owner;
        uint256 tokenId;
        uint256 slot;
        bool revoked;
        string metadataURI;
    }

    uint256 private _tokenCounter;
    uint256[] private _allTokens;
    address[] private adminList;

    mapping(uint256 => Token) private _tokens;
    mapping(address => uint256[]) private _ownedTokens;
    mapping(uint256 => address) private _issuers;
    mapping(address => string) private _adminInstitutions; // Mapping from admin address to their institution

    event Issued(address indexed to, uint256 indexed tokenId);
    event Revoked(address indexed from, uint256 indexed tokenId);
    event AdminAssigned(address indexed admin);
    event AdminRevoked(address indexed admin);

    constructor() ERC721("SoulboundToken", "SBT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Deployer is the super admin
    }

    // =========================================== //
    // ===== [1] Contract Deployer Functions ===== //
    // =========================================== //

    // [1.1] Assign a new institution admin
    function assignAdmin(
        address admin,
        string memory institution
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(admin != address(0), "Cannot assign zero address");
        require(!hasRole(ISSUER_ROLE, admin), "Already an admin");
        require(bytes(institution).length > 0, "Institution cannot be empty");

        grantRole(ISSUER_ROLE, admin);
        adminList.push(admin);
        _adminInstitutions[admin] = institution; // Store institution

        emit AdminAssigned(admin);
    }

    // [1.2] Revoke an institution admin
    function revokeAdmin(address admin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasRole(ISSUER_ROLE, admin), "Not an admin");
        revokeRole(ISSUER_ROLE, admin);

        // Remove admin from the list
        for (uint256 i = 0; i < adminList.length; i++) {
            if (adminList[i] == admin) {
                adminList[i] = adminList[adminList.length - 1]; // Move last element to deleted position
                adminList.pop(); // Remove last element
                break;
            }
        }
        emit AdminRevoked(admin);
    }

    // [1.3] Get a list of all institution admins and their institutions
    function getAdmins()
        external
        view
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (address[] memory, string[] memory)
    {
        uint256 adminCount = adminList.length;
        address[] memory adminAddresses = new address[](adminCount);
        string[] memory institutions = new string[](adminCount);

        for (uint256 i = 0; i < adminCount; i++) {
            address admin = adminList[i];
            adminAddresses[i] = admin;
            institutions[i] = _adminInstitutions[admin];
        }

        return (adminAddresses, institutions);
    }

    // =========================================== //
    // ===== [2] Institution Admin Functions ===== //
    // =========================================== //

    //Issue a Soulbound Token (SBT) to an address.
    function issue(
        address to,
        uint256 slot,
        string memory metadataURI
    ) external onlyRole(ISSUER_ROLE) {
        require(to != address(0), "Cannot mint to zero address");

        uint256 tokenId = ++_tokenCounter;
        _tokens[tokenId] = Token(to, tokenId, slot, false, metadataURI);
        _issuers[tokenId] = msg.sender;
        _ownedTokens[to].push(tokenId);
        _allTokens.push(tokenId);

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit Issued(to, tokenId);
    }

    // Revoke a Soulbound Token (SBT).
    function revoke(uint256 tokenId) external onlyRole(ISSUER_ROLE) {
        require(_tokens[tokenId].owner != address(0), "Token does not exist");
        require(!_tokens[tokenId].revoked, "Token already revoked");
        require(_issuers[tokenId] == msg.sender, "Only issuer can revoke");

        _tokens[tokenId].revoked = true;

        emit Revoked(_tokens[tokenId].owner, tokenId);
    }

    // Function for an admin to get their own institution
    function getInstitution()
        external
        view
        onlyRole(ISSUER_ROLE)
        returns (string memory)
    {
        return _adminInstitutions[msg.sender];
    }

    // ✅ Get all issued token details for the caller
    // ✅ Get all issued token details for the caller
    function getAllIssuedTokenDetails()
        external
        view
        onlyRole(ISSUER_ROLE)
        returns (Token[] memory)
    {
        uint256 totalTokens = _allTokens.length;
        Token[] memory tempTokens = new Token[](totalTokens);
        uint256 count = 0;

        for (uint256 i = 0; i < totalTokens; i++) {
            uint256 tokenId = _allTokens[i];

            // ✅ Filter by the caller (admin issuing tokens or contract owner)
            if (
                _issuers[tokenId] == msg.sender ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender)
            ) {
                tempTokens[count] = _tokens[tokenId];
                count++;
            }
        }

        // ✅ Trim the array to remove empty slots (Solidity 0.8+ required)
        Token[] memory filteredTokens = new Token[](count);
        for (uint256 j = 0; j < count; j++) {
            filteredTokens[j] = tempTokens[j];
        }

        return filteredTokens;
    }

    // ========================================== //
    // ===== [3] Institution User Functions ===== //
    // ========================================== //

    // Check if a token is revoked. Return True if revoked, false otherwise.
    function isRevoked(
        uint256 tokenId
    ) external view onlyRole(ISSUER_ROLE) returns (bool) {
        require(
            _issuers[tokenId] == msg.sender ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "You can only check tokens issued by your organization"
        );
        return _tokens[tokenId].revoked;
    }

    // Query who issued the token (ERC-5727 requirement to have an issuerOf function)
    function issuerOf(
        uint256 tokenId
    ) external view onlyRole(ISSUER_ROLE) returns (address) {
        require(
            _issuers[tokenId] == msg.sender ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "You can only check tokens issued by your organization"
        );
        return _issuers[tokenId];
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControl, ERC721URIStorage) returns (bool) {
        return
            interfaceId == type(AccessControl).interfaceId ||
            interfaceId == type(ERC721URIStorage).interfaceId ||
            interfaceId == 0x80ac58cd || // ERC-721 compatibility for OpenSea & MetaMask
            interfaceId == 0x00000000 || // Placeholder for ERC-5727
            interfaceId == 0x01ffc9a7 || // ERC-165 support
            super.supportsInterface(interfaceId);
    }
}
