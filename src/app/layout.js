import { Inter } from "next/font/google";
import { Red_Hat_Display } from "next/font/google";
import "./globals.css";

const redhat = Red_Hat_Display({ subsets: ["latin"] });

export const metadata = {
  title: "Sophie Chan",
  description: "Sophie personal website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={redhat.className}>{children}</body>
    </html>
  );
}
