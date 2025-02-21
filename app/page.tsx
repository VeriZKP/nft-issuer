"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { getInstitution } from "../utils/contractInteractions";
import MintNFT from "./components/MintNFT";
import MintedNFTs from "./components/MintedNFT";

export default function Admin() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState<string | null>("");
  const [activeTab, setActiveTab] = useState("mint");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const metamaskSigner = await provider.getSigner();

        setWalletAddress(accounts[0]);

        // Fetch institution info after wallet connects
        fetchInstitution(metamaskSigner);
      } catch (error) {
        console.error("🚨 Connection error:", error);
      }
    } else {
      alert("❌ MetaMask is not installed! Please install it.");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setInstitutionName(""); // Reset institution when disconnecting
  };

  // ✅ Function to Fetch Institution
  const fetchInstitution = async (signer: ethers.Signer) => {
    try {
      const institution = await getInstitution(signer);
      setInstitutionName(institution);
    } catch (error) {
      console.error("🚨 Error fetching institution:", error);
      setInstitutionName(null);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      <header className="flex items-center justify-between w-full h-[10%] px-16 gap-16 border-b">
        <p className="truncate text-lg max-w-[70%]">
          Wallet:{" "}
          <span className="font-semibold">
            {walletAddress ? walletAddress : "Not connected"}
            {institutionName && ` ( ${institutionName} )`}{" "}
          </span>
          {/* ✅ Show Institution */}
        </p>
        <button
          onClick={walletAddress ? disconnectWallet : connectWallet}
          className={`px-4 py-2 rounded-lg ${walletAddress ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"}`}
        >
          {walletAddress ? "Disconnect" : "Connect"}
        </button>
      </header>

      <main className="flex flex-col w-full h-[90%]">
        <div className="flex w-full h-[10%] border-b">
          <button
            onClick={() => setActiveTab("mint")}
            className={`flex-1 p-3 text-center font-semibold ${activeTab === "mint" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Mint NFT
          </button>
          <button
            onClick={() => setActiveTab("minted")}
            className={`flex-1 p-3 text-center font-semibold ${activeTab === "minted" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Minted NFTs
          </button>
        </div>

        <div className="flex-grow p-6 overflow-y-hidden">
          {activeTab === "mint" ? (
            <MintNFT adminInstitution={institutionName ?? ""} />
          ) : (
            <MintedNFTs />
          )}
        </div>
      </main>
    </div>
  );
}
