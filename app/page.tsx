"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  issueSBT,
  revokeSBT,
  getIssuedTokensByAdmin,
  getAdminInstitution,
} from "../utils/contractInteractions";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [institution, setInstitution] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [issuedNFTs, setIssuedNFTs] = useState<any[]>([]);

  // ** Issue NFT Form State **
  const [recipient, setRecipient] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("Student"); // Default: Student
  const [idNumber, setIdNumber] = useState("");
  const [expirationDays, setExpirationDays] = useState(30); // Default to 30 days

  // ✅ Connect Wallet (MetaMask)
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []); // Request accounts
        const signer = await provider.getSigner();

        setWalletAddress(accounts[0]);
        setSigner(signer);

        await fetchAdminData(); // Fetch institution and issued NFTs
      } catch (error) {
        console.error("🚨 Connection error:", error);
      }
    } else {
      alert("❌ MetaMask is not installed! Please install it.");
    }
  };

  // ✅ Disconnect Wallet
  const disconnectWallet = () => {
    setWalletAddress(null);
    setSigner(null);
    setInstitution(null);
    setIssuedNFTs([]);
  };

  // ✅ Fetch admin institution and issued NFTs
  const fetchAdminData = async () => {
    if (!walletAddress) return;
    try {
      const institutionName = await getAdminInstitution();
      setInstitution(institutionName);

      const issuedTokens = await getIssuedTokensByAdmin();
      setIssuedNFTs(issuedTokens);
    } catch (error) {
      console.error("🚨 Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchAdminData();
    }
  }, [walletAddress]);

  // ✅ Handle issuing an NFT
  const handleIssueNFT = async () => {
    if (!signer) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!recipient || !name || !title || !idNumber) {
      alert("All fields are required.");
      return;
    }

    try {
      const success = await issueSBT(
        recipient,
        name,
        title,
        idNumber,
        expirationDays
      );
      if (success) {
        alert(`✅ NFT issued to ${recipient}!`);
        await fetchAdminData(); // Refresh issued NFTs
      }
    } catch (error) {
      console.error("🚨 Error issuing NFT:", error);
    }
  };

  // ✅ Handle revoking an NFT
  const handleRevokeNFT = async (tokenId: number) => {
    if (!signer) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const success = await revokeSBT(tokenId);
      if (success) {
        alert(`❌ NFT (Token ID: ${tokenId}) has been revoked!`);
        await fetchAdminData(); // Refresh issued NFTs
      }
    } catch (error) {
      console.error("🚨 Error revoking NFT:", error);
    }
  };

  return (
    <div
      className="flex flex-col h-screen w-screen bg-white"
      style={{ boxShadow: "0 0 0 1px black" }}
    >
      {/* ✅ Header: Wallet Address & Institution */}
      <header
        className="flex items-center justify-between w-full h-[10%] px-16 gap-16"
        style={{ boxShadow: "0 0 0 1px black" }}
      >
        <p className="truncate text-lg max-w-[70%]">
          Wallet:{" "}
          <span className="font-semibold">
            {walletAddress
              ? `${walletAddress} (${institution || "Loading..."})`
              : "Not connected"}
          </span>
        </p>
        <button
          onClick={walletAddress ? disconnectWallet : connectWallet}
          className={`px-4 py-2 rounded-lg ${
            walletAddress
              ? "bg-[#FF9E9E] hover:bg-red-500 text-white"
              : "bg-[#9EFFA5] hover:bg-green-500 text-white"
          }`}
        >
          {walletAddress ? "Disconnect" : "Connect"}
        </button>
      </header>

      {/* ✅ Main Content: Issue NFT (Left) & Issued NFTs Table (Right) */}
      <main className="flex justify-between w-full h-[90%] flex-grow p-8 gap-8">
        {/* ✅ Left Side: Issue NFT Form */}
        <div id="issueNFT" className="w-[50%] p-6 border rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-center">Issue NFT</h2>

          {/* Recipient Wallet Address */}
          <label className="block mb-1">Recipient Wallet Address</label>
          <input
            type="text"
            className="border p-2 w-full mb-2"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />

          {/* Name */}
          <label className="block mb-1">Name</label>
          <input
            type="text"
            className="border p-2 w-full mb-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Title Selection */}
          <label className="block mb-1">Title</label>
          <select
            className="border p-2 w-full mb-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          >
            <option value="Student">Student</option>
            <option value="Professor">Professor</option>
            <option value="Intern">Intern</option>
            <option value="Employee">Employee</option>
          </select>

          {/* ID Number */}
          <label className="block mb-1">ID Number</label>
          <input
            type="text"
            className="border p-2 w-full mb-2"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
          />

          {/* Expiration Days */}
          <label className="block mb-1">Expiration Days</label>
          <input
            type="number"
            className="border p-2 w-full mb-2"
            value={expirationDays}
            onChange={(e) => setExpirationDays(Number(e.target.value))}
          />

          <button
            onClick={handleIssueNFT}
            className="bg-blue-500 text-white px-4 py-2 rounded-md w-full"
          >
            Issue NFT
          </button>
        </div>

        {/* ✅ Right Side: Issued NFTs Table */}
        <div id="issuedNFTs" className="w-[50%] overflow-x-scroll">
          <h2 className="text-xl font-bold mb-4">Issued NFTs</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Token ID</th>
                <th className="border px-4 py-2">Owner</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Title</th>
                <th className="border px-4 py-2">Masked ID</th>
                <th className="border px-4 py-2">Hashed ID</th>
                <th className="border px-4 py-2">Revoked</th>
              </tr>
            </thead>
            <tbody>
              {issuedNFTs.map((nft) => (
                <tr key={nft.tokenId} className="text-center">
                  {/* ✅ Token ID */}
                  <td className="border px-4 py-2">{nft.tokenId}</td>

                  {/* ✅ Owner Wallet (Truncated) */}
                  <td className="border px-4 py-2">
                    {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                  </td>

                  {/* ✅ NFT Metadata */}
                  <td className="border px-4 py-2">{nft.name}</td>
                  <td className="border px-4 py-2">{nft.title}</td>
                  <td className="border px-4 py-2">{nft.idMasked}</td>

                  {/* ✅ Shortened Hashed ID for UI (First 10 chars) */}
                  <td className="border px-4 py-2">
                    {nft.idHashed.slice(0, 10)}...
                  </td>

                  {/* ✅ Revoked Status or Revoke Button */}
                  <td className="border px-4 py-2">
                    {nft.revoked ? (
                      <span className="text-red-500 font-semibold">Yes</span>
                    ) : (
                      <button
                        onClick={() => handleRevokeNFT(nft.tokenId)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
