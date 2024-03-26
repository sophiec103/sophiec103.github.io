import { Inter } from "next/font/google";
import { Red_Hat_Text } from "next/font/google";
import Navbar from "./navbar";
import "./globals.scss";

const redhat = Red_Hat_Text({ subsets: ["latin"] });

export const metadata = {
  title: "Sophie Chan",
  description: "Sophie personal website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
          <link rel="icon" href="./logo.svg" />
        </head>
      <body className={redhat.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
