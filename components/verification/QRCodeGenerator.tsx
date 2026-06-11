'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  verificationId: string;
  baseUrl?: string;
}

export default function QRCodeGenerator({
  verificationId,
  baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://veriproof.app',
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const qrValue = `${baseUrl}/verify/${verificationId}`;

    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        qrValue,
        {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          quality: 0.95,
          margin: 1,
          width: 200,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR Code generation failed:', error);
        }
      );
    }
  }, [verificationId, baseUrl]);

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.href = canvasRef.current.toDataURL('image/png');
      link.download = `verification-${verificationId}.png`;
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="p-4 bg-white rounded-lg border-2 border-gray-200 dark:border-dark-700">
        <canvas ref={canvasRef} />
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-4 text-center">
        Scan to verify certificate
      </p>
      <button
        onClick={downloadQRCode}
        className="mt-3 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-secondary transition"
      >
        Download QR Code
      </button>
    </div>
  );
}
