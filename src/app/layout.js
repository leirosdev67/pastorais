import "./globals.css";

export const metadata = {
  title: "Pastorais - Paróquia Nossa Senhora da Candelária",
  description: "Guia interativo das Pastorais da Paróquia de Candelária.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0d101d",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <div className="bg-gradient-radial" />
        {children}
      </body>
    </html>
  );
}
