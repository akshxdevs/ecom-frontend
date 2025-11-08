"use client";
import { ArrowRight, ChevronDown, ShoppingBagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import localFont from "next/font/local"; 

const myFont = localFont({
    src: '../public/fonts/Palmore.otf',
});

export default function Home() {
  const router = useRouter();
  return (
    <div>
      <div className="max-w-[98%] w-full mx-auto flex justify-between items-center gap-4 py-3 ">
        <div onClick={()=>router.push("/")} className="flex items-center gap-1">
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

      <div className="flex justify-center items-center gap-2 font-sans text-sm bg-blue-400/30">
        <p className="bg-blue-600 px-2 py-0.5 rounded-xl">NEW</p>
        <p className={`${myFont.className} text-2xl`}>Offer Available!</p>
        <p>Check out the new trending offers and exclusive deals</p>
        <ArrowRight size={15}/>
      </div>
      <div>
        // main header
        <div>
          // title
        </div>
        <div>
          // description
        </div>
        <div>
          // start btn
        </div>
      </div>
      <div>
        // animation banner
      </div>
      <div>
        // cryto image slider
      </div>
    </div>
  );
}
