import { QRCodeSVG } from "qrcode.react";

export default function AppointmentQRCode({ reference }) {
    if (!reference) return null;

    return (
        <div className="appointment-qr">
            <h3>Appointment QR Code</h3>

            <QRCodeSVG
                value={reference}
                size={200}
                level="H"
                marginSize={2}
            />

            <p>Reference: {reference}</p>
            <p>Show this QR code at reception.</p>
        </div>
    );
}