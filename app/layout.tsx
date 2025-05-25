import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Annam App",
  description: "Created with Annam",
  generator: "Annam.ai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
