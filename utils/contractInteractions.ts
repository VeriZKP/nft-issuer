import { ethers } from "ethers";
import SoulboundABI from "./Soulbound.json";

let contractAddress: string | null = null; // Store the contract address after first fetch

// ✅ Function to Fetch Contract Address Securely
const fetchContractAddress = async () => {
  if (!contractAddress) {
    try {
      const response = await fetch("/api/get-contract-address");
      const data = await response.json();
      contractAddress = data.contractAddress;

      if (!contractAddress) {
        throw new Error("❌ Contract address is missing.");
      }
    } catch (error) {
      console.error("❌ Error fetching contract address:", error);
      throw error;
    }
  }
  return contractAddress;
};

// ✅ Function to Get Provider (MetaMask or Ganache)
const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum); // MetaMask Provider
  } else {
    return new ethers.JsonRpcProvider("http://127.0.0.1:7545"); // Ganache Fallback
  }
};

// ✅ Function to Get Smart Contract Instance
const getContract = async (signer?: ethers.Signer) => {
  const provider = getProvider();
  const contractAddr = await fetchContractAddress(); // Ensure contract address is fetched

  return new ethers.Contract(
    contractAddr,
    SoulboundABI, // Ensure ABI is correctly structured
    signer || (await provider.getSigner()) // Await provider if MetaMask is used
  );
};

// ============================================================ //
// ============= [1] Issue Soulbound Token (SBT) ============== //
// ============================================================ //
export const issueSoulboundToken = async (
  signer: ethers.Signer,
  recipient: string,
  slot: number,
  metadataURI: string
) => {
  try {
    const contract = await getContract(signer);
    const tx = await contract.issue(recipient, slot, metadataURI);
    await tx.wait(); // Wait for transaction confirmation
    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error("🚨 Error issuing SBT:", error);
    return { success: false, error };
  }
};

// ============================================================ //
// ================ [2] Revoke Soulbound Token ================= //
// ============================================================ //
export const revokeSoulboundToken = async (
  signer: ethers.Signer,
  tokenId: number
) => {
  try {
    const contract = await getContract(signer);
    const tx = await contract.revoke(tokenId);
    await tx.wait();
    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error("🚨 Error revoking SBT:", error);
    return { success: false, error };
  }
};

// ============================================================ //
// =========== [3] Get Institution of the Admin =============== //
// ============================================================ //
export const getInstitution = async (signer: ethers.Signer) => {
  try {
    const contract = await getContract(signer);
    const institution = await contract.getInstitution();
    return institution;
  } catch (error) {
    console.error("🚨 Error fetching institution:", error);
    return null;
  }
};

// ============================================================ //
// ========== [4] Fetch All Tokens Issued by Admin ============ //
// ============================================================ //
export const getAllIssuedTokens = async (signer: ethers.Signer) => {
  try {
    const contract = await getContract(signer);
    const tokens = await contract.getAllIssuedTokenDetails();

    console.log(tokens)

    return tokens.map((token: any) => ({
      owner: token.owner,
      tokenId: token.tokenId.toString(),
      slot: token.slot.toString(),
      revoked: token.revoked,
      metadataURI: token.metadataURI,
    }));
  } catch (error) {
    console.error("🚨 Error fetching issued tokens:", error);
    return [];
  }
};
