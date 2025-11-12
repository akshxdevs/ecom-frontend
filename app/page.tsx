"use client";
import { ArrowRight, ChevronDown, ShoppingBagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import localFont from "next/font/local"; 
import { TokenSOL, TokenETH } from '@token-icons/react';
import { InfiniteCryptoSlider } from "./Components/HomePage/CryptoImgeSlider";
import { useEffect, useState } from "react";

const myFont = localFont({
    src: '../public/fonts/Palmore.otf',
});

const bannerFont = localFont({
  src:'../public/fonts/BricolageGrotesque-VariableFont_opsz.ttf',
});

const explorebtn = localFont({
  src:'../public/fonts/MartianMono-VariableFont_wdth,wght.ttf',
});

function useScrollParallax({
  speed = 0.5,              
  initial = 0,                
}: { speed?: number; initial?: number } = {}) {
  const [offset, setOffset] = useState(initial);

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const delta = window.scrollY - lastY;         
      lastY = window.scrollY;
      setOffset((prev) => prev - delta * speed);    
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);

  return offset;
}

function FloatingSol() {
  const y = useScrollParallax();

  return (
    <div
      className="absolute right-[22%] bottom-44 lg:bottom-[180px] px-4 py-2 rounded-md border border-zinc-800 bg-zinc-900 transition-transform"
      style={{ transform: `translateY(${y}px)` }}
    >
      <TokenSOL size={40} variant="branded" />
    </div>
  );
}

function FloatingEth() {
  const y = useScrollParallax({ speed: 0.4 });

  return (
    <div
      className="absolute right-[72%] top-[790px] lg:top-[600px] px-4 py-2 rounded-md border border-zinc-800 bg-zinc-900"
      style={{ transform: `translateY(${y}px)` }}
    >
      <TokenETH size={40} variant="branded" />
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  return (
    <div>
      <div className="max-w-[90%] w-full mx-32 flex justify-between items-center gap-4 py-3">
        <div onClick={()=>router.push("/")} className="flex items-center">
          <ShoppingBagIcon size={20}/>
          <h1 className={`${myFont.className} hidden md:block font-bold text-3xl cursor-pointer text-white-1/2`}>blockBazzar</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 py-2 px-4 font-sans text-xs bg-white/85 text-black rounded-l-full rounded-tr-xl rounded-br-xl">
            Products
            <ChevronDown size={15} className="mt-0.5"/>
          </button>
          <button className="flex items-center gap-1 py-2 px-4 font-sans text-xs bg-white/85 text-black rounded-xl">
            Reasources
            <ChevronDown size={15} className="mt-0.5"/>
          </button>
          <button className="flex items-center gap-1 py-2 px-4 font-sans text-xs bg-white/85 text-black rounded-xl">
            Developers
            <ChevronDown size={15} className="mt-0.5"/>
          </button>
          <button className="flex items-center gap-1 py-2 px-4 font-sans text-xs bg-white/85 text-black rounded-r-full rounded-tl-xl rounded-bl-xl">
            Pricing
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 py-2 px-4 font-sans text-xs rounded-r-full text-black bg-white/95 rounded-l-full rounded-tr-xl rounded-br-xl">
              contact us
          </button>
          <button className="flex items-center gap-1 py-2 px-4 font-sans text-sm font-bold rounded-r-full bg-zinc-800 rounded-tl-xl rounded-bl-xl">
              Go to dashboard
          </button>
        </div>
      </div>

      <div className={`flex justify-center items-center gap-2 font-sans text-sm bg-blue-400/30`}>
        <p className="bg-blue-600 px-2 py-0.5 rounded-xl">NEW</p>
        <p className={`${myFont.className} text-2xl`}>Offer Available!</p>
        <p>Check out the new trending offers and exclusive deals</p>
        <ArrowRight size={15}/>
      </div>
      <div className={`${bannerFont.className} flex flex-col justify-center items-center pt-10 pb-5`}>
        <h1 className="text-6xl font-semibold">All products</h1>
        <h1 className="text-6xl font-semibold">in your <span className="text-6xl font-semibold">on-chain app</span></h1>
      </div>
      <div className="flex justify-center items-center">
        <h2 className="text-zinc-500 w-[40%] text-center">Access 7+ million tokens with liquidity from 130+ exchanges,with the best prices and the smoothest trading experience.</h2>
      </div>
      <div className="flex justify-center items-center py-5">
        <button onClick={()=>router.push("/products")} className={`${explorebtn.className} flex items-center py-2 px-4 font-sans font-semibold text-sm text-black bg-white/95 rounded-xl`}>
          Explore
        </button>
      </div>
      <div className="flex justify-center items-center py-20">
        <img src="/img/banner.png" alt="banner" className="border border-zinc-700 rounded-md h-1/2 w-1/2 object-cover"/>
        <div>
          <FloatingSol/>
        </div>
        <div>
          <FloatingEth/>
        </div>
      </div>
      <div className="relative min-h-screen">
        <div className="absolute inset-x-0 bottom-0 bg-zinc-900 py-20 top-[-110px]">
          <InfiniteCryptoSlider />
        </div>
      </div>
    </div>
  );
}
