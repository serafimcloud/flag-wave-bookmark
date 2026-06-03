import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "flag-wave-bookmark",
  description:
    "A React bookmark icon that ripples like a flag in the wind - a procedural sine-wave on the SVG path, eased in on hover and settling back on leave.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
