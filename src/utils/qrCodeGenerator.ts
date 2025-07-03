import QRCode from "qrcode";

export const generateQrCode = async (
  ticketId: string,
  seatId: string,
  showId: string,
  userId: string,
) => {
  const data = JSON.stringify({
    ticketId,
    seatId,
    showId,
    userId,
  });

  try {
    const qrCodeBase64 = await QRCode.toDataURL(data);
    return qrCodeBase64;
  } catch (err) {
    console.error("Error generating QR code", err);
  }
};
