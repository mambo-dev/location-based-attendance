import QRCode from "qrcode.react";

type QrProps = {
  url: string;
};

export default function QRCodeGenerator({ url }: QrProps) {
  return <QRCode value={url} />;
}
