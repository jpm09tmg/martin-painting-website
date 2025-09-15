import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from './providers/AuthProvider'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Martin Painting - Professional Painting Services Calgary",
  description: "Expert interior and exterior painting services for residential and commercial properties in Calgary.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
