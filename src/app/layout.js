import "./globals.css";

export const metadata = {
  title: "Painel de Pastorais - Paróquia",
  description: "Exibição de slides para TV e Totem Touchscreen interativo de pastorais paroquiais.",
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
