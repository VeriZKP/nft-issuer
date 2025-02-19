// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC5727SBT is Ownable {
    // =========================================== //
    // ===== [0] Data Structures & Variables ===== //
    // =========================================== //

    // ✅ Struct: Defines a Soulbound Token (SBT) with its associated metadata
    struct Token {
        address owner; // The wallet address that owns the SBT
        uint256 tokenId; // Unique identifier of the SBT
        string name; // Name of the person receiving the SBT
        string institution; // Institution associated with the SBT (e.g., SIT, UOB)
        string title; // Title or role (e.g., student, professor, intern)
        string idMasked; // Partially masked ID (e.g., "2****3")
        bytes32 idHashed; // Hashed version of (Institution + ID)
        uint256 expiration; // Expiration timestamp
        bool revoked; // Whether the SBT has been revoked
    }

    // ✅ Mappings for Tracking NFTs
    mapping(address => string) private _adminInstitutions; // Maps admin address to institution name
    mapping(address => bool) private _isAdmin; // Maps admin address → Boolean (true if admin)
    mapping(address => uint256) private _nftsIssuedByAdmin; // Maps admin → Number of NFTs they've issued
    mapping(uint256 => Token) private _tokens; // Maps tokenId → Token details
    mapping(address => uint256[]) private _ownedTokens; // Maps user address → List of their token IDs
    mapping(uint256 => address) private _issuedBy; // ✅ Tracks which admin issued each NFT  <-- INSERT THIS HERE

    // ✅ Arrays for Tracking All Tokens
    uint256[] private _allTokens; // Stores all token IDs that have been issued
    uint256 private _tokenCounter; // Counter for generating unique token IDs

    // ✅ Events: Used for emitting logs when actions occur
    event Issued(address indexed to, uint256 indexed tokenId);
    event Revoked(address indexed from, uint256 indexed tokenId);
    event AdminAssigned(address indexed admin);
    event AdminRevoked(address indexed admin);

    // =========================================== //
    // ===== [1] Contract Deployer Functions ===== //
    // =========================================== //
    // ✅ [1.0] Construct the Contract Deployer <-------------------------------- Start of everything
    constructor() Ownable(msg.sender) {}

    // ✅ [1.1] Assign an admin (Only contract owner can call)
    function assignAdmin(
        address admin,
        string memory institution
    ) external onlyOwner {
        _isAdmin[admin] = true;
        _adminInstitutions[admin] = institution; // ✅ Store institution name
        emit AdminAssigned(admin);
    }

    // ✅ [1.2] Revoke admin rights (Only contract owner)
    function revokeAdmin(address admin) external onlyOwner {
        _isAdmin[admin] = false;
        emit AdminRevoked(admin);
    }

    // ✅ [1.3] Fetch all assigned admins and their NFT issuance count
    function getAllAdmins()
        external
        view
        onlyOwner
        returns (address[] memory, string[] memory, uint256[] memory)
    {
        uint256 totalAdmins = 0;

        // Count total admins
        for (uint256 i = 0; i < _allTokens.length; i++) {
            address admin = _tokens[_allTokens[i]].owner;
            if (_isAdmin[admin]) {
                totalAdmins++;
            }
        }

        // Allocate memory for result arrays
        address[] memory adminWallets = new address[](totalAdmins);
        string[] memory institutions = new string[](totalAdmins);
        uint256[] memory nftsIssued = new uint256[](totalAdmins);

        uint256 index = 0;
        for (uint256 i = 0; i < _allTokens.length; i++) {
            address admin = _tokens[_allTokens[i]].owner;
            if (_isAdmin[admin]) {
                adminWallets[index] = admin;
                institutions[index] = _tokens[_allTokens[i]].institution;
                nftsIssued[index] = _nftsIssuedByAdmin[admin];
                index++;
            }
        }

        return (adminWallets, institutions, nftsIssued);
    }

    // =========================================== //
    // ===== [2] Institution Admin Functions ===== //
    // =========================================== //
    // ✅ [2.1] Issue an SBT (Only Admins can call)
    function issue(
        address to,
        string memory name,
        string memory title,
        string memory idNumber,
        uint256 expirationDays
    ) external {
        require(_isAdmin[msg.sender], "Not an admin");
        require(to != address(0), "Cannot mint to zero address");

        string memory institution = _adminInstitutions[msg.sender]; // ✅ Fetch institution from admin
        require(bytes(institution).length > 0, "Admin institution not set");

        // ✅ Set default expiration to 30 days if no value is provided
        if (expirationDays == 0) {
            expirationDays = 30;
        }

        uint256 tokenId = ++_tokenCounter;
        string memory idMasked = maskID(idNumber);
        bytes32 idHashed = hashID(institution, idNumber);
        uint256 expiration = block.timestamp + (expirationDays * 1 days);

        _tokens[tokenId] = Token(
            to,
            tokenId,
            name,
            institution, // ✅ Auto-filled from admin
            title,
            idMasked,
            idHashed,
            expiration,
            false
        );
        _ownedTokens[to].push(tokenId);
        _allTokens.push(tokenId);

        // ✅ Track NFTs issued by admin
        _nftsIssuedByAdmin[msg.sender]++;
        _issuedBy[tokenId] = msg.sender; // ✅ Track which admin issued this NFT <-- INSERT THIS HERE

        emit Issued(to, tokenId);
    }

    // ✅ [2.2] Revoke an SBT
    function revoke(uint256 tokenId) external {
        require(_isAdmin[msg.sender], "Not an admin");
        require(_tokens[tokenId].owner != address(0), "Token does not exist");
        require(!_tokens[tokenId].revoked, "Token already revoked");

        _tokens[tokenId].revoked = true;
        emit Revoked(_tokens[tokenId].owner, tokenId);
    }

    // ✅ [2.3] Fetch all NFTs issued by the logged-in Institution Admin
    function getIssuedTokensByAdmin()
        external
        view
        returns (
            uint256[] memory tokenIds,
            address[] memory owners,
            string[] memory names,
            string[] memory institutions,
            string[] memory titles,
            string[] memory idMaskedList,
            bytes32[] memory idHashedList,
            uint256[] memory expirations,
            bool[] memory revokedStatus
        )
    {
        require(_isAdmin[msg.sender], "Not an admin");

        uint256 totalIssued = _nftsIssuedByAdmin[msg.sender];

        // Allocate memory for result arrays
        tokenIds = new uint256[](totalIssued);
        owners = new address[](totalIssued);
        names = new string[](totalIssued);
        institutions = new string[](totalIssued);
        titles = new string[](totalIssued);
        idMaskedList = new string[](totalIssued);
        idHashedList = new bytes32[](totalIssued);
        expirations = new uint256[](totalIssued);
        revokedStatus = new bool[](totalIssued);

        uint256 index = 0;
        for (uint256 i = 0; i < _allTokens.length; i++) {
            uint256 tokenId = _allTokens[i];

            if (_issuedBy[tokenId] == msg.sender) {
                // ✅ Ensure NFTs are issued by this admin
                tokenIds[index] = tokenId;
                owners[index] = _tokens[tokenId].owner;
                names[index] = _tokens[tokenId].name;
                institutions[index] = _tokens[tokenId].institution;
                titles[index] = _tokens[tokenId].title;
                idMaskedList[index] = _tokens[tokenId].idMasked;
                idHashedList[index] = _tokens[tokenId].idHashed;
                expirations[index] = _tokens[tokenId].expiration;
                revokedStatus[index] = _tokens[tokenId].revoked;
                index++;
            }
        }

        return (
            tokenIds,
            owners,
            names,
            institutions,
            titles,
            idMaskedList,
            idHashedList,
            expirations,
            revokedStatus
        );
    }

    // ✅ [2.4] Fetch the institution of the logged-in admin
    function getInstitution() external view returns (string memory) {
        require(_isAdmin[msg.sender], "Not an admin");
        return _adminInstitutions[msg.sender];
    }

    // ========================================== //
    // ===== [3] Institution User Functions ===== //
    // ========================================== //
    // ✅ [3.1] Fetch SBTs for the logged-in user
    function getUserTokens() external view returns (uint256[] memory) {
        return _ownedTokens[msg.sender]; // ✅ Now msg.sender retrieves their own SBTs
    }

    // ✅ [3.2] Get metadata for all SBTs owned by the logged-in user
    function getTokenMetadata()
        external
        view
        returns (
            uint256[] memory tokenIds,
            string[] memory names,
            string[] memory institutions,
            string[] memory titles,
            string[] memory idMaskedList,
            bytes32[] memory idHashedList,
            uint256[] memory expirations,
            bool[] memory revokedStatus
        )
    {
        uint256[] memory userTokens = _ownedTokens[msg.sender]; // ✅ Get tokens of msg.sender
        uint256 totalTokens = userTokens.length;

        // Allocate memory for result arrays
        tokenIds = new uint256[](totalTokens);
        names = new string[](totalTokens);
        institutions = new string[](totalTokens);
        titles = new string[](totalTokens);
        idMaskedList = new string[](totalTokens);
        idHashedList = new bytes32[](totalTokens);
        expirations = new uint256[](totalTokens);
        revokedStatus = new bool[](totalTokens);

        for (uint256 i = 0; i < totalTokens; i++) {
            uint256 tokenId = userTokens[i];
            Token memory token = _tokens[tokenId];

            // ✅ Auto-check if the token is expired
            bool isExpired = block.timestamp >= token.expiration;

            // ✅ Populate return arrays
            tokenIds[i] = tokenId;
            names[i] = token.name;
            institutions[i] = token.institution;
            titles[i] = token.title;
            idMaskedList[i] = token.idMasked;
            idHashedList[i] = token.idHashed;
            expirations[i] = token.expiration;
            revokedStatus[i] = isExpired || token.revoked; // ✅ Auto-expire logic
        }

        return (
            tokenIds,
            names,
            institutions,
            titles,
            idMaskedList,
            idHashedList,
            expirations,
            revokedStatus
        );
    }

    // ================================ //
    // ===== [4] Helper Functions ===== //
    // ================================ //
    // ✅ [4.1] Utility: Mask ID (Show first & last digit, hide middle)
    function maskID(string memory id) private pure returns (string memory) {
        bytes memory b = bytes(id);
        if (b.length < 2) return id;
        return string(abi.encodePacked(b[0], "****", b[b.length - 1]));
    }

    // ✅ [4.2] Utility: Hash ID (Institution + ID)
    function hashID(
        string memory institution,
        string memory id
    ) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(institution, id));
    }

    // ✅ [4.3] Utility: Hash ID (Institution + ID)
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return
            interfaceId == 0x80ac58cd || // ERC-721 compatibility for OpenSea & MetaMask
            interfaceId == 0x00000000 || // Placeholder for ERC-5727
            interfaceId == 0x01ffc9a7; // ERC-165 support
    }
}
