"use client";
import React, { useMemo, useState, useEffect } from "react";
import QRCode from "qrcode";

// Define props with strong types
interface SolanaPayQRProps {
  recipient: string;        // base58 public key (required)
  amount?: number | string; // amount in SOL (optional)
  label?: string;           // merchant / app name
  message?: string;         // description / order id
  reference?: string;       // transaction reference (optional)
  splToken?: string;        // SPL mint address if not native SOL
}

const SolanaPayQR: React.FC<SolanaPayQRProps> = ({
  recipient,
  amount,
  label,
  message,
  reference,
  splToken,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const solanaUrl = useMemo(() => {
    if (!recipient) return "";
    const params = new URLSearchParams();

    if (amount !== undefined && amount !== null)
      params.set("amount", String(amount));
    if (splToken) params.set("spl-token", splToken);
    if (reference) params.set("reference", reference);
    if (label) params.set("label", label);
    if (message) params.set("message", message);

    const qs = params.toString();
    return `${recipient}${qs ? `?${qs}` : ""}`;
  }, [recipient, amount, label, message, reference, splToken]);

  useEffect(() => {
    if (!solanaUrl) {
      setQrDataUrl("");
      return;
    }

    QRCode.toDataURL(solanaUrl, { errorCorrectionLevel: "H" })
      .then((url:any) => setQrDataUrl(url))
      .catch((err:any) => {
        console.error("QR generation error:", err);
        setQrDataUrl("");
      });
  }, [solanaUrl]);

  const phantomUniversalLink = useMemo(() => {
    if (!recipient) return "";
    const params = new URLSearchParams();

    if (amount !== undefined && amount !== null)
      params.set("amount", String(amount));
    if (splToken) params.set("spl-token", splToken);
    params.set("recipient", recipient);
    if (reference) params.set("reference", reference);
    if (label) params.set("label", label);
    if (message) params.set("message", message);

    return `https://phantom.app/ul/v1/transfer?${params.toString()}`;
  }, [recipient, amount, splToken, reference, label, message]);

  function shortAddress() {
    if (!solanaUrl) return "";
    return solanaUrl.length > 10
      ? `${solanaUrl.slice(0, 18)}${solanaUrl.slice(-4)}...`
      : solanaUrl;
  }

  return (
    <div className="flex justify-center items-center py-5">
      <div className="p-2 w-full border flex justify-between rounded-xl bg-white">

   
  {qrDataUrl ? (
        <a
          href={phantomUniversalLink}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={qrDataUrl}
            alt="Solana Pay QR"
            style={{ width: 60, height: 60 }}
          />
        </a>
      ) : (
        <div>No QR available</div>
      )}
        <div className="max-w-[75%] w-full pt-2">
          <h1 className="text-sm text-zinc-500 font-semibold">Seller's wallet address</h1>
          <p className="text-md text-zinc-800 font-bold">{shortAddress()}</p>
        </div>
      </div>
    </div>
  );
};

export default SolanaPayQR;
