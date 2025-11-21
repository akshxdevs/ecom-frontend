"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast"
import WalletProviderWrapper from "./Components/WalletProvider";
import { CartLengthProvider } from "./utils/contexts/CartLenContext";
import { SellerPubkeyProvider } from "./utils/contexts/sellerPubkeyContext";
import { SelectProvider } from "./utils/contexts/selectContext";
import { CreateProdProvider } from "./utils/contexts/showCreateModelContext";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <WalletProviderWrapper>
            <CartLengthProvider>
              <SellerPubkeyProvider>
                <SelectProvider>
                  <CreateProdProvider>
                    {children}
                    <Toaster 
                      position="top-right"
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: '#1e293b',
                          color: "#fff"
                        }
                      }}
                    />
                  </CreateProdProvider>
                </SelectProvider>
              </SellerPubkeyProvider>
            </CartLengthProvider>
          </WalletProviderWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
