"use client";
import { Appbar } from "@/app/Components/Appbar";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import Lottie from "lottie-react";
import successAnim from "../../animations/Checkmark.json";
import localFont from "next/font/local";
import { BiLeftArrow, BiSolidRightArrow } from "react-icons/bi";
import { ArrowBigLeftDash, ArrowBigLeftIcon, ArrowRight, ChevronRight } from "lucide-react";

const myFont = localFont({
  src: '../../../public/fonts/Palmore.otf',
});
export default function Order() {
    const router = useRouter();
    const {OrderPubkey} = useParams();
    console.log("Order PublicKey: ", OrderPubkey);
    useEffect(() => {
        setTimeout(() => import("canvas-confetti").then((c) => c.default()), 1000);
      }, []);
    
      return (
        <div>
            <Appbar/>
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="w-48 h-48">
                    <Lottie animationData={successAnim} loop={false} />
                </div>
                <div className="relative bottom-10 flex flex-col justify-center items-center">
                    <h1 className={`${myFont.className} text-6xl font-semibold text-green-600`}>Order Confirmed!</h1>
                    <p className="text-gray-200 mt-2">Thank you for your purchase 🎉</p>
                    <button onClick={()=>router.push(`/order/${OrderPubkey}/order-details`)} className="cursor-pointer flex items-center py-2 mt-10 pr-2 pl-4 border rounded-xl bg-white text-zinc-900 font-semibold">
                         More Details
                         <ChevronRight/>
                    </button>
                </div>
            
            </div>
        </div>
      );
}