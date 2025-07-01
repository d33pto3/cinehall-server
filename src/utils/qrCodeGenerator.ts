import QRCode from "qrcode";

export const generateQrCode = async (
  ticketId: string,
  seats: string[],
  showId: string,
) => {
  const data = JSON.stringify({
    ticketId,
    seats,
    showId,
  });

  try {
    const qrCodeBase64 = await QRCode.toDataURL(data);
    return qrCodeBase64;
  } catch (err) {
    console.error("Error generating QR code", err);
  }
};
