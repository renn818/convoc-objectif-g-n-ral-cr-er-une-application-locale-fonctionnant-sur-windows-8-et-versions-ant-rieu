import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CONVOC - Gestion de Convocation AG",
  description: "Application de gestion de convocations d'assemblées générales pour copropriétés",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}