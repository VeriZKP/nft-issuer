export default function MintedNFTs() {
  const mintedNFTs = [
    { id: 1, name: "Soulbound #1", image: "https://via.placeholder.com/150" },
    { id: 2, name: "Soulbound #2", image: "https://via.placeholder.com/150" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-center">Minted NFTs</h2>
      <div className="grid grid-cols-2 gap-4">
        {mintedNFTs.map((nft) => (
          <div
            key={nft.id}
            className="p-4 border rounded-lg shadow-md text-center"
          >
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full rounded mb-2"
            />
            <p className="font-bold">{nft.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
