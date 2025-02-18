"use client";

import { useState } from "react";
import { ethers } from "ethers";
import {} from "../utils/contractInteractions";

export default function Admin() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [users, setUsers] = useState<{ wallet: string; realName: string }[]>(
    []
  );
  const [userInstitutions, setUserInstitutions] = useState<
    {
      wallet: string;
      realName: string;
      preferredName: string;
      idNumber: string;
      title: string;
      institution: string;
      phone: string;
      email: string;
    }[]
  >([]);

  // ** Tabs State **
  const [activeTab, setActiveTab] = useState("register");

  // ** User Registration Form State **
  const [userAddress, setUserAddress] = useState("");
  const [realName, setRealName] = useState("");

  // ** Add Institution Form State **
  const [institutionUser, setInstitutionUser] = useState(""); // Wallet Address
  const [preferredName, setPreferredName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [title, setTitle] = useState("Student"); // Default: Student
  const [institution, setInstitution] = useState("SIT");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // ✅ Connect Wallet (MetaMask)
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []); // Request accounts
        const signer = await provider.getSigner(); // Get signer from MetaMask

        setWalletAddress(accounts[0]);
        setSigner(signer);

        fetchUsers(); // Fetch users after connecting
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
  };

  /// ✅ **Fetch Users & Institutions**
  const fetchUsers = async () => {
    try {
      // Fetch users for the dropdown
      const allUsers = await getAllUsers();
      setUsers(allUsers);

      // Fetch users with institutions for the table
      const allUserInstitutions = await getAllUsersWithInstitutions();
      setUserInstitutions(allUserInstitutions);
    } catch (error) {
      console.error("🚨 Error fetching users:", error);
    }
  };

  // ✅ **Handle Register User**
  const handleRegisterUser = async () => {
    if (!signer) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!userAddress || !realName) {
      alert("All fields are required.");
      return;
    }

    try {
      await registerUser(signer, userAddress, realName);
      alert(`✅ User ${realName} registered successfully!`);
      fetchUsers();
    } catch (error) {
      console.error("🚨 Error registering user:", error);
    }
  };

  // ✅ **Handle Add Institution**
  const handleAddInstitution = async () => {
    if (!signer) {
      alert("Please connect your wallet first!");
      return;
    }

    if (
      !institutionUser ||
      !preferredName ||
      !idNumber ||
      !title ||
      !institution
    ) {
      alert("All fields are required.");
      return;
    }

    try {
      await addInstitution(
        signer,
        institutionUser,
        preferredName,
        idNumber,
        title,
        institution,
        phone,
        email
      );
      alert(`✅ Institution ${institution} added successfully!`);
      fetchUsers();
    } catch (error) {
      console.error("🚨 Error adding institution:", error);
    }
  };

  return (
    <div
      className="flex flex-col h-screen w-screen bg-white"
      style={{ boxShadow: "0 0 0 1px black" }}
    >
      <header
        className="flex items-center justify-between w-full h-[10%] px-16 gap-16"
        style={{ boxShadow: "0 0 0 1px black" }}
      >
        <p className="truncate text-lg max-w-[70%]">
          Wallet:{" "}
          <span className="font-semibold">
            {walletAddress ? walletAddress : "Not connected"}
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

      <main className="flex justify-center w-full h-[90%] flex-grow p-8 gap-8">
        <div id="forms" className="flex flex-col w-[50%] gap-8">
          {/* Tab Navigation */}
          <div className="flex">
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 p-3 text-center font-semibold rounded-t-md ${
                activeTab === "register"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Register User
            </button>
            <button
              onClick={() => setActiveTab("institution")}
              className={`flex-1 p-3 text-center font-semibold rounded-t-md ${
                activeTab === "institution"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Add Institution
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 border rounded-lg shadow-lg w-full h-screen overflow-y-scroll">
            {activeTab === "register" ? (
              <>
                <h2 className="text-xl font-bold mb-4 text-center">
                  Register User
                </h2>

                {/* User Wallet Address */}
                <div className="flex flex-col mb-2">
                  <label className="text-sm font-semibold mb-1">
                    User Wallet Address
                  </label>
                  <input
                    type="text"
                    className="border p-2 w-full"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                  />
                </div>

                {/* Real Name */}
                <div className="flex flex-col mb-2">
                  <label className="text-sm font-semibold mb-1">
                    Real Name
                  </label>
                  <input
                    type="text"
                    className="border p-2 w-full"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleRegisterUser}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md w-full"
                >
                  Register User
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4 text-center">
                  Add Institution
                </h2>

                {/* User Wallet Address Dropdown */}
                <label className="block mb-1">User Wallet Address</label>
                <select
                  className="border p-2 w-full mb-2"
                  value={institutionUser}
                  onChange={(e) => {
                    setInstitutionUser(e.target.value);
                    const selectedUser = users.find(
                      (user) => user.wallet === e.target.value
                    );
                    setPreferredName(selectedUser ? selectedUser.realName : ""); // Auto-fill preferred name
                  }}
                >
                  <option value="">Select a Wallet</option>
                  {users.map((user, index) => (
                    <option key={index} value={user.wallet}>
                      {user.wallet}
                    </option>
                  ))}
                </select>

                {/* Preferred Name Input */}
                <label className="block mb-1">Preferred Name</label>
                <input
                  type="text"
                  placeholder={preferredName || "Mandatory"}
                  className="border p-2 w-full mb-2"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                />

                {/* ID Number */}
                <div className="flex flex-col mb-2">
                  <label className="text-sm font-semibold mb-1">
                    ID Number
                  </label>
                  <input
                    type="text"
                    placeholder="Mandatory"
                    className="border p-2 w-full"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                  />
                </div>

                {/* Institution Name */}
                <div className="flex flex-col mb-2">
                  <label className="text-sm font-semibold mb-1">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    placeholder="Mandatory"
                    className="border p-2 w-full"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                  />
                </div>

                {/* Title Selection */}
                <div className="flex flex-col mb-2">
                  <label className="text-sm font-semibold">Title:</label>
                  <select
                    className="border p-2 w-full"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  >
                    <option value="Student">Student</option>
                    <option value="Professor">Professor</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
                {/* Phone Number */}
                <div className="flex flex-col mb-2">
                  <label className="text-sm font-semibold">Phone Number:</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="border p-2 w-full"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* Email Address */}
                <div className="flex flex-col mb-2">
                  <label className="text-sm font-semibold">
                    Email Address:
                  </label>
                  <input
                    type="email"
                    placeholder="Optional"
                    className="border p-2 w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleAddInstitution}
                  className="bg-green-500 text-white px-4 py-2 rounded-md w-full"
                >
                  Add Institution
                </button>
              </>
            )}
          </div>
        </div>
        {/* Users & Institutions Table */}
        <div id="table" className="w-[50%] overflow-x-scroll">
          <h2 className="text-xl font-bold mb-4">Users & Institutions</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Wallet</th>
                <th className="border border-gray-300 px-4 py-2">Real Name</th>
                <th className="border border-gray-300 px-4 py-2">
                  Preferred Name
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Institution
                </th>
                <th className="border border-gray-300 px-4 py-2">Title</th>
                <th className="border border-gray-300 px-4 py-2">ID Number</th>
                <th className="border border-gray-300 px-4 py-2">Phone</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {userInstitutions.map((user, index) => (
                <tr key={index} className="text-center">
                  <td className="border px-4 py-2 truncate max-w-[120px]">
                    {user.wallet}
                  </td>
                  <td className="border px-4 py-2">{user.realName}</td>
                  <td className="border px-4 py-2">{user.preferredName}</td>
                  <td className="border px-4 py-2">{user.institution}</td>
                  <td className="border px-4 py-2">{user.title}</td>
                  <td className="border px-4 py-2">{user.idNumber}</td>
                  <td className="border px-4 py-2">{user.phone}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
