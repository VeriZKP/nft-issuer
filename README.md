# 🪪 Identity Card NFT Issuer

This is a decentralized application (DApp) for issuing **Ethereum-Compatible (ERC-5727) Soulbound Tokens** — non-transferable NFTs that represent identity credentials, memberships, or academic verifications. The system ensures that **only authorized institution admins** can mint and revoke tokens, while users can view NFTs issued to them.

---

## 🔧 Features

### 🏛️ Contract Deployer (Super Admin)
- Assign institution admins with associated institution names.
- Revoke admin access.
- View all institution admins and their associated institutions.

### 🧑‍💼 Institution Admin
- Issue Soulbound Tokens (SBTs) to wallet addresses.
- Revoke issued SBTs.
- View a list of all NFTs they have issued.

### 🧑 Institution User
- View all tokens received (non-transferable).
- Each token includes metadata such as:
  - Name
  - ID (masked and hashed)
  - Institution
  - Position
  - Expiration (optional)
  - Status (active/revoked)

---

## 💡 Tech Stack

| Layer         | Tools/Tech                                      |
|---------------|--------------------------------------------------|
| Smart Contract| Solidity, OpenZeppelin ERC721URIStorage         |
| Backend API   | Next.js API Routes (Pinata IPFS integration)     |
| Frontend      | Next.js 14, React, Tailwind CSS, Ethers.js       |
| IPFS Gateway  | Pinata Gateway                                   |
| Wallet Support| MetaMask (EVM-compatible)                        |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/sbt-issuer.git
cd sbt-issuer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a .env file:

``` .env
NEXT_PUBLIC_PINATA_GATEWAY=https://your-gateway.pinata.cloud
PINATA_JWT=your_pinata_jwt_token
```

## 🔗 Smart Contract Overview
Contract: ERC5727SBT.sol

Based on ERC-721

Adds role-based access control via AccessControl

Soulbound logic: no transfer functions are exposed

Stores metadataURI per token (e.g., pointing to IPFS)

## 📦 Pinata Integration
NFT metadata and preview card image are uploaded to IPFS via Pinata.

Metadata schema includes:

{
  "name": "Alice",
  "id_masked": "9****1",
  "id_hashed": "<hashed_value>",
  "institution": "SIT",
  "position": "STUDENT",
  "image": "ipfs://<image_hash>"
}
🖼️ Screens
Admin Dashboard: Connect wallet, issue NFT, view minted NFTs, revoke token.

Token Preview: Dynamic card generator with live preview and gradient styling.

Metadata Fetching: Fetches metadata from Pinata gateway and renders to UI.

📁 Folder Structure
php
Copy
Edit
├── app/
│   ├── components/        # React components (MintNFT, MintedNFTs)
│   ├── api/               # API routes for interacting with IPFS/Pinata
├── contracts/             # Solidity smart contracts
├── utils/                 # Ethers.js contract interactions
├── public/                # Static files
├── .env.local             # Environment variables
└── README.md
🧪 Future Improvements
Add expiration logic to NFTs

Add analytics (total issued per institution)

Support ENS display for wallets

Cross-chain SBT deployment (e.g., Solana)

📜 License
MIT License © 2024 YourName

🙌 Acknowledgements
OpenZeppelin Contracts

Pinata IPFS

Ethers.js

MetaMask
