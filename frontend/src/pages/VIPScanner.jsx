import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion } from "framer-motion";
import { Scan, ShieldCheck, Camera, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function VIPScanner() {
  const [hasCamera, setHasCamera] = useState(true);
  const [scannedResult, setScannedResult] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    let html5QrCode;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          html5QrCode = new Html5Qrcode("reader");
          
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              // Success callback
              setScannedResult(decodedText);
              setScannerActive(false);
              if (html5QrCode.isScanning) {
                html5QrCode.stop().catch(console.error);
              }
            },
            (errorMessage) => {
              // Ignore scan errors, they happen continuously until a code is found
            }
          );
          setScannerActive(true);
        } else {
          setHasCamera(false);
        }
      } catch (err) {
        console.error("Error starting scanner:", err);
        setHasCamera(false);
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="min-h-[100svh] bg-black text-white relative overflow-hidden flex flex-col pt-24 pb-12">
      <SEO title="VIP Scanner" noindex={true} />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-emerald-900/20 pointer-events-none" />
      <div className="absolute inset-0 aurora opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg mx-auto px-6 flex-1 flex flex-col">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors self-start mb-8">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/10 mb-4"
          >
            <Scan size={24} className="text-emerald-400" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl font-extrabold tracking-tight mb-2"
          >
            Scan for Magic
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60"
          >
            Align your VIP access code within the frame to authenticate.
          </motion.p>
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-center">
          {!scannedResult ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative w-full max-w-[320px] aspect-square rounded-[2rem] overflow-hidden glass border border-white/10 shadow-2xl flex items-center justify-center bg-black/50"
            >
              {!hasCamera ? (
                <div className="text-center p-6 flex flex-col items-center">
                  <Camera size={32} className="text-white/30 mb-3" />
                  <p className="text-sm text-white/60">Camera not found or access denied.</p>
                </div>
              ) : (
                <>
                  {/* The #reader element is where html5-qrcode mounts the video element */}
                  <div id="reader" className="w-full h-full flex items-center justify-center [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />
                  
                  {scannerActive && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Viewfinder borders */}
                      <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
                      <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
                      <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
                      <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
                      
                      {/* Scanning laser animation */}
                      <motion.div 
                        animate={{ top: ["20%", "80%", "20%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-[10%] right-[10%] h-0.5 bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.5)]" 
                      />
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-[320px] mx-auto glass rounded-[2rem] p-8 border border-emerald-500/30 text-center relative overflow-hidden flex flex-col items-center"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-indigo-500" />
              <div className="mt-4 w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <ShieldCheck size={40} className="text-emerald-400" />
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">Access Granted</h2>
              <p className="text-white/60 mb-6 text-sm">Authentication successful for VIP code.</p>
              
              <div className="bg-black/40 rounded-xl p-4 font-mono text-emerald-400 text-sm break-all border border-white/5 mb-6 shadow-inner">
                {scannedResult}
              </div>

              <button 
                onClick={() => {
                  window.location.reload();
                }}
                className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors"
              >
                Scan Another Code
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
