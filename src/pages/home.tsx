import { NFTMintForm } from '@/components/nft-mint-form';

export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to SUI NFT Mint</h2>
          <p className="text-muted-foreground">
            Create and mint your own NFTs on the SUI blockchain
          </p>
        </div>
        
        <NFTMintForm />
      </div>
    </div>
  );
}
