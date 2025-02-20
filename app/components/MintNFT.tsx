import { useState } from "react";
import html2canvas from "html2canvas";

// Determine gradient colors based on institution
const getGradientColors = (institution: string) => {
  switch (institution.toUpperCase()) {
    case "SIT":
      return ["#231F20", "#ED1C24"];
    case "UOB":
      return ["#005EB8", "#ED1C24"];
    default:
      return ["#000000", "#FFFFFF"];
  }
};

// Function to hash ID display
const maskID = (id: string) => {
  if (id.length < 3) return id;
  return `${id[0]}****${id[id.length - 1]}`;
};

export default function MintNFT() {
  const [name, setName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [institution, setInstitution] = useState("");
  const [position, setPosition] = useState("");
  const [ipfsMetadataURI, setIpfsMetadataURI] = useState<string | null>(null);
  const [gatewayImageURI, setGatewayImageURI] = useState<string | null>(null);
  const [gatewayMetadataURI, setGatewayMetadataURI] = useState<string | null>(
    null
  );

  const [color1, color2] = getGradientColors(institution);

  // ✅ Function to Capture & Upload Image to Pinata
  const captureAndUploadToPinata = async () => {
    const cardElement = document.getElementById("identity-card");
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement);
      canvas.toBlob(async (blob) => {
        if (!blob) return console.error("Error converting canvas to Blob");

        const formData = new FormData();
        formData.append("file", blob, "identity_card.png");
        formData.append("institution", institution);
        formData.append("position", position);
        formData.append("name", name);
        formData.append("idNumber", idNumber);

        const response = await fetch("/api/uploadImageToPinata", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (data.gatewayImageURI && data.gatewayMetadataURI) {
          setIpfsMetadataURI(data.ipfsMetadataURI);
          setGatewayImageURI(data.gatewayImageURI);
          setGatewayMetadataURI(data.gatewayMetadataURI);
          console.log(data.gatewayMetadataURI);
        } else {
          console.error("🚨 Error: No metadata or image URL returned");
        }
      }, "image/png");
    } catch (error) {
      console.error("Error capturing or uploading:", error);
    }
  };

  return (
    <div className="flex h-full gap-8">
      {/* Left Side: Input Form */}
      <div className="w-1/2 p-4 border rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">Mint a New NFT</h2>
        <form>
          <input
            type="text"
            placeholder="Enter Institution"
            className="w-full p-2 border rounded mb-2"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Position"
            className="w-full p-2 border rounded mb-2"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Name"
            className="w-full p-2 border rounded mb-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter ID Number"
            className="w-full p-2 border rounded mb-2"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
          />
          <button
            type="button"
            onClick={captureAndUploadToPinata}
            className="w-full bg-green-500 text-white p-2 rounded mt-2"
          >
            Upload to Pinata
          </button>
        </form>

        {/* ✅ Display IPFS Metadata URI */}
        {ipfsMetadataURI && (
          <p className="mt-4 text-sm text-gray-600 text-center">
            ✅ IPFS Metadata: {ipfsMetadataURI}
          </p>
        )}

        {/* ✅ Display Uploaded Image as a Clickable Link */}
        {gatewayImageURI && (
          <p className="mt-4 text-sm text-gray-600 text-center">
            ✅ Image Uploaded:{" "}
            <a
              href={gatewayImageURI}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline hover:text-blue-700 transition"
            >
              View Image on IPFS
            </a>
          </p>
        )}

        {/* ✅ Display Metadata URI as a Clickable Link */}
        {gatewayMetadataURI && (
          <p className="mt-4 text-sm text-gray-600 text-center">
            ✅ Metadata Uploaded:{" "}
            <a
              href={gatewayMetadataURI}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline hover:text-blue-700 transition"
            >
              View Metadata on IPFS
            </a>
          </p>
        )}
      </div>

      {/* Right Side: Preview Canvas */}
      <div className="w-1/2 flex justify-center items-center">
        <div
          id="identity-card"
          className="relative p-4 flex flex-col items-center justify-between h-full aspect-square rounded-xl text-white shadow-md"
          style={{
            background: `linear-gradient(45deg, ${color1}, ${color2})`,
          }}
        >
          {/* Institution (Top Left) */}
          <p className="w-full text-left text-6xl font-semibold">
            {institution || "..."}
          </p>

          {/* Name (Middle) */}
          <div className="flex flex-col items-center">
            <h3 className="text-4xl font-bold text-center">
              {name || "<name>"}
            </h3>

            {/* Hashed ID Number (Below Name) */}
            <p className="text-2xl">{idNumber ? maskID(idNumber) : "<id>"}</p>
          </div>

          {/* Position (Bottom Right) */}
          <p className="w-full text-right text-6xl font-semibold">
            {position || "..."}
          </p>
        </div>
      </div>
    </div>
  );
}
