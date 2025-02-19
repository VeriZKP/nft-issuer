import { ethers } from "ethers";
import ContractABI from "./ERC5727SBT.json";

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

// ✅ Set up provider (Using Metamask injected provider)
const getProvider = () => {
  if (!window.ethereum) throw new Error("MetaMask is not installed!");
  return new ethers.BrowserProvider(window.ethereum);
};

// ✅ Get contract instance with signer (Admin)
const getContractWithSigner = async () => {
  const provider = getProvider();
  const contractAddr = await fetchContractAddress();
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddr, ContractABI, signer);
};

// =========================================== //
// ===== [2] Institution Admin Functions ===== //
// =========================================== //

// ✅ [2.1] Issue an SBT
export const issueSBT = async (
  to: string,
  name: string,
  title: string,
  idNumber: string,
  expirationDays: number = 30 // ✅ Default to 30 days if empty
) => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.issue(to, name, title, idNumber, expirationDays);
    await tx.wait();
    console.log(`✅ SBT issued to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Error issuing SBT:", error);
    return false;
  }
};

// ✅ [2.2] Revoke an SBT
export const revokeSBT = async (tokenId: number) => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.revoke(tokenId);
    await tx.wait();
    console.log(`✅ SBT revoked (Token ID: ${tokenId})`);
    return true;
  } catch (error) {
    console.error("❌ Error revoking SBT:", error);
    return false;
  }
};

// ✅ [2.3] Fetch all NFTs issued by the **logged-in** Admin
export const getIssuedTokensByAdmin = async () => {
  try {
    const contract = await getContractWithSigner();
    const [
      tokenIds,
      owners,
      names,
      institutions,
      titles,
      idMaskedList,
      idHashedList,
      expirations,
      revokedStatus,
    ] = await contract.getIssuedTokensByAdmin(); // ✅ NO PARAMETER NOW

    return tokenIds.map((tokenId: number, index: number) => ({
      tokenId,
      owner: owners[index],
      name: names[index],
      institution: institutions[index],
      title: titles[index],
      idMasked: idMaskedList[index],
      idHashed: idHashedList[index],
      expiration: new Date(Number(expirations[index]) * 1000), // ✅ Convert Unix timestamp properly
      revoked: revokedStatus[index],
    }));
  } catch (error) {
    console.error("❌ Error fetching issued tokens:", error);
    return [];
  }
};

// ✅ [2.4] Fetch the institution name of the logged-in admin
export const getAdminInstitution = async () => {
  try {
    const contract = await getContractWithSigner();
    const institution = await contract.getInstitution();
    console.log(`✅ Admin's Institution: ${institution}`);
    return institution;
  } catch (error) {
    console.error("❌ Error fetching admin's institution:", error);
    return null;
  }
};
