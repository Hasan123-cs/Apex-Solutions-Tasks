import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onScan, onClose }) {
    const scannerRef = useRef(null);
    const onScanRef = useRef(onScan);
    const scannedRef = useRef(false);
    const [error, setError] = useState("");

    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        let disposed = false;
        const scanner = new Html5Qrcode("smartqueue-qr-reader");
        scannerRef.current = scanner;

        async function start() {
            try {
                await scanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 220, height: 220 },
                    },
                    (decodedText) => {
                        if (disposed || scannedRef.current) return;

                        scannedRef.current = true;
                        onScanRef.current(decodedText);
                    },
                    () => { }
                );

                if (disposed && scanner.isScanning) {
                    await scanner.stop();
                }
            } catch {
                if (!disposed) {
                    setError(
                        "Unable to access camera. Check camera permissions."
                    );
                }
            }
        }

        start();

        return () => {
            disposed = true;

            if (scanner.isScanning) {
                scanner.stop().catch(console.error);
            }
        };
    }, []);

    return (
        <div className="lq-qr-overlay">
            <div className="lq-qr-modal">
                <h3>Scan Appointment QR</h3>

                <div id="smartqueue-qr-reader" />

                {error && <p role="alert">{error}</p>}

                <button
                    type="button"
                    className="lq-outline"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
}