import { NextResponse } from "next/server";
import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY!,
});

export async function POST(req: Request) {
  try {
    const { ipfsHashes } = await req.json();
    if (!ipfsHashes || !Array.isArray(ipfsHashes)) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const metadataList = [];

    for (const ipfsHash of ipfsHashes) {
      try {
        const data = await pinata.gateways.get(ipfsHash);

        if (data && data.data) {
          const metadata = { ...data.data }; // Clone the metadata object

          // ✅ Replace `ipfs://` with `https://gateway`
          if (metadata.image && metadata.image.startsWith("ipfs://")) {
            const ipfsCID = metadata.image.split("ipfs://")[1]; // Extract CID
            metadata.image = `https://${process.env.PINATA_GATEWAY}/ipfs/${ipfsCID}`;
          }

          metadataList.push(metadata); // Store the updated metadata object
        }
      } catch (error) {
        console.error(`🚨 Error fetching metadata for ${ipfsHash}:`, error);
      }
    }

    return NextResponse.json(metadataList);
  } catch (error) {
    console.error("🚨 Error reading Pinata metadata:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
