import "./globals.css";

export const metadata = {
  title: 'Paróquia Nossa Senhora da Candelária - Pastorais',
  description: 'Conheça as pastorais e atividades da nossa comunidade.',
  other: {
    "google-adsense-account": "ca-pub-8979732765071797",
  },
  openGraph: {
    title: 'Paróquia Nossa Senhora da Candelária - Pastorais',
    description: 'Conheça as pastorais e atividades da Paróquia Nossa Senhora da Candelária.',
    url: 'https://pastorais.vercel.app',
    siteName: 'Pastorais',
    images: [
      {
        url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ5XtKPIgn_xOHbBVsQ-fnBBZSdBrxzxpmjshz6j-HZphsQWwlQLYboY4&s=10',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
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
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="google-adsense-account" content="ca-pub-8979732765071797" />
        <link rel="manifest" href="/manifest.json" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8979732765071797"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="antialiased">
        <div className="bg-gradient-radial" />
        {children}
      </body>
    </html>
  );
}


