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
        const response = await pinata.gateways.get(ipfsHash);

        // ✅ Ensure response is correctly formatted
        if (response && response.data) {
          let metadata;

          // ✅ Check if response.data is a JSON object or a Blob
          if (typeof response.data === "object") {
            metadata = { ...response.data };
          } else if (response.data instanceof Blob) {
            const textData = await response.data.text();
            metadata = JSON.parse(textData); // Convert Blob to JSON
          } else {
            console.warn(`Unexpected data format for ${ipfsHash}`);
            continue;
          }

          // ✅ Replace `ipfs://` with `https://gateway/...`
          if (
            metadata.image &&
            typeof metadata.image === "string" &&
            metadata.image.startsWith("ipfs://")
          ) {
            metadata.image = metadata.image.replace(
              "ipfs://",
              process.env.PINATA_GATEWAY + "/"
            );
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
