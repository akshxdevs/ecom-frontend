import { TokenSOL, TokenETH, TokenBTC, TokenBNB, TokenMATIC, TokenAVAX, TokenADA, TokenDOT, TokenATOM, TokenARB } from '@token-icons/react';

export const InfiniteCryptoSlider = () => {
    const cryptoSlider = [
        { title: 'Ethereum',   icon: <TokenETH size={32} variant="branded" /> },
        { title: 'Solana',     icon: <TokenSOL size={32} variant="branded" /> },
        { title: 'Bitcoin',    icon: <TokenBTC size={32} variant="branded" /> },
        { title: 'BNB',  icon: <TokenBNB size={32} variant="branded" /> },
        { title: 'Polygon',    icon: <TokenMATIC size={32} variant="branded" /> },
        { title: 'Avalanche',  icon: <TokenAVAX size={32} variant="branded" /> },
        { title: 'Cardano',    icon: <TokenADA size={32} variant="branded" /> },
        { title: 'Polkadot',   icon: <TokenDOT size={32} variant="branded" /> },
        { title: 'Cosmos',     icon: <TokenATOM size={32} variant="branded" /> },
        { title: 'Arbitrum',   icon: <TokenARB size={32} variant="branded" /> },
      ];
    
    return (
        <div className="overflow-hidden bg-gradient-to from-zinc-900 to-zinc-800">
            <div className="flex animate-slide">
                {cryptoSlider.map((item, index) => (
                <div
                    key={index}
                    className="flex items-center gap-1 px-4 transition-transform hover:scale-110"
                >
                    <div className="flex items-center gap-2 border px-2  py-1 rounded-xl border-zinc-700">
                        {item.icon}
                        <span className="text-white font-medium text-sm whitespace-nowrap">
                        {item.title}
                        </span> 
                    </div>
                </div>
                ))}
            </div>
        </div>
  );
}
