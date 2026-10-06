import type { Metadata } from "next";
import "./globals.css";
import { AntdProvider } from "@/components/antd-provider";
import { AuthProvider } from "@/components/auth-provider";
export const metadata: Metadata = { title: "HotelHex Portal", description: "Hotel operations dashboard" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AntdProvider><AuthProvider>{children}</AuthProvider></AntdProvider></body></html>;
}
