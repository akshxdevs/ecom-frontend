"use client";
import { useRouter } from "next/navigation";
import { Products, useCartLength } from "./Products";
import { Flag, Heart, IndianRupee, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import localFont from "next/font/local";
import { IN, US } from "country-flag-icons/react/3x2";
import { BiDownArrow } from "react-icons/bi";

const myFont = localFont({
  src: '../../../public/fonts/Palmore.otf',
});
const myFont2 = localFont({
  src: '../../../public/fonts/PalmoreLight.ttf',
});

export const ProductsAppBar = () => {
    const router = useRouter();
    const { cartLength } = useCartLength(); 
    return(
    <div>
            <div className="flex justify-between py-5">
            <div>
            <h1 className={`${myFont.className} text-6xl`}>
                Products
            </h1>
            </div>
            <div className="flex items-center gap-3">
            <div className="flex">
                <US title="USA" className="w-8 h-8"/>
                {/* <IN title="India" className="w-8 h-8"/> */}
                <span className="mt-3"><BiDownArrow/></span>
            </div>
            <div>
                <button>
                <Heart size={29}/>
                </button>
            </div>
            <div>
                <button
                onClick={() => router.push("/cart")}
                className="text-white cursor-pointer"
                >
                <ShoppingCart size={29}/>
                </button>
                <span className="relative text-red-500 font-semibold right-3 bg-white rounded-full px-1.5 py-0.5">
                {cartLength}
                </span>
            </div>
            </div>
        </div>
        <div>
        <div className={`${myFont2.className} text-2xl mb-10 text-center text-gray-300`}>
            <p>you’ll browse the shop, see the tee, hit buy, sign the tx, burn a little gas, own the look, love the vibe, and somehow feel completely happy</p>      
        </div>
        </div>
    </div>
    );
}