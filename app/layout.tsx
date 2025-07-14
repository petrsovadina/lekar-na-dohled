import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin', 'latin-ext'], // Support for Czech diacritics
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'DoktorNaDohled - AI platforma pro české zdravotnictví',
  description: 'Inteligentní vyhledávání lékařů a zdravotnických služeb v České republice s podporou AI asistenta.',
  keywords: [
    'lékaři', 'zdravotnictví', 'AI asistent', 'objednání', 'telemedicína', 
    'česká republika', 'zdravotní pojišťovna', 'specializace'
  ],
  authors: [{ name: 'DoktorNaDohled Team' }],
  creator: 'DoktorNaDohled',
  publisher: 'DoktorNaDohled',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    url: 'https://doktor-na-dohled.vercel.app',
    siteName: 'DoktorNaDohled',
    title: 'DoktorNaDohled - AI platforma pro české zdravotnictví',
    description: 'Najděte svého lékaře rychle a jednoduše s pomocí AI asistenta.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DoktorNaDohled - AI platforma pro zdravotnictví',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DoktorNaDohled - AI platforma pro české zdravotnictví',
    description: 'Najděte svého lékaře rychle a jednoduše s pomocí AI asistenta.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
  // GDPR and Privacy compliance
  other: {
    'csrf-token': 'generated-csrf-token',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" className={`${inter.variable} antialiased`}>
      <head>
        {/* Czech locale specific meta tags */}
        <meta httpEquiv="Content-Language" content="cs" />
        <meta name="geo.region" content="CZ" />
        <meta name="geo.country" content="Czech Republic" />
        <meta name="geo.placename" content="Praha" />
        
        {/* Healthcare specific meta tags */}
        <meta name="health.category" content="healthcare-platform" />
        <meta name="health.compliance" content="GDPR,EHDS" />
        
        {/* Security headers for healthcare data */}
        <meta httpEquiv="Content-Security-Policy" 
              content="default-src 'self'; 
                       script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
                       style-src 'self' 'unsafe-inline'; 
                       img-src 'self' data: https:; 
                       connect-src 'self' https://api.openai.com https://*.supabase.co;" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Czech fonts support */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        {/* GDPR Banner will be added here */}
        <div id="gdpr-banner-root"></div>
        
        {/* Main application container */}
        <div className="relative flex min-h-screen flex-col">
          {/* Header with navigation */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 hidden md:flex">
                <a className="mr-6 flex items-center space-x-2" href="/">
                  <span className="hidden font-bold sm:inline-block">DoktorNaDohled</span>
                </a>
                <nav className="flex items-center space-x-6 text-sm font-medium">
                  <a href="/vyhledavani" className="transition-colors hover:text-foreground/80">
                    Vyhledávání lékařů
                  </a>
                  <a href="/rezervace" className="transition-colors hover:text-foreground/80">
                    Rezervace
                  </a>
                  <a href="/telemedicina" className="transition-colors hover:text-foreground/80">
                    Telemedicína
                  </a>
                </nav>
              </div>
              <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <div className="w-full flex-1 md:w-auto md:flex-none">
                  {/* User authentication will be added here */}
                </div>
              </div>
            </div>
          </header>
          
          {/* Main content area */}
          <main className="flex-1">
            {children}
          </main>
          
          {/* Footer with legal information */}
          <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
              <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  © 2024 DoktorNaDohled. Všechna práva vyhrazena.
                  <br />
                  Platforma pro vyhledávání zdravotnických služeb v České republice.
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <a href="/ochrana-osobnich-udaju" className="hover:text-foreground">
                  Ochrana osobních údajů
                </a>
                <a href="/podminky-uziti" className="hover:text-foreground">
                  Podmínky užití
                </a>
                <a href="/kontakt" className="hover:text-foreground">
                  Kontakt
                </a>
              </div>
            </div>
          </footer>
        </div>
        
        {/* Toast container for notifications */}
        <div id="toast-root"></div>
        
        {/* Modal container */}
        <div id="modal-root"></div>
        
        {/* Script for GDPR compliance initialization */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize GDPR compliance check
              (function() {
                if (localStorage.getItem('gdpr-consent') === null) {
                  // Show GDPR banner if no consent recorded
                  document.addEventListener('DOMContentLoaded', function() {
                    // This will be handled by the GDPR component
                  });
                }
              })();
            `,
          }}
        />
        
        {/* Czech language schema markup for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'MedicalWebPage',
              name: 'DoktorNaDohled',
              description: 'AI platforma pro vyhledávání lékařů v České republice',
              url: 'https://doktor-na-dohled.vercel.app',
              inLanguage: 'cs',
              audience: {
                '@type': 'MedicalAudience',
                audienceType: 'Patient',
                geographicArea: {
                  '@type': 'Country',
                  name: 'Czech Republic',
                  alternateName: 'Česká republika'
                }
              },
              provider: {
                '@type': 'Organization',
                name: 'DoktorNaDohled',
                description: 'Platforma pro vyhledávání zdravotnických služeb'
              },
              lastReviewed: new Date().toISOString().split('T')[0],
              reviewedBy: {
                '@type': 'Organization',
                name: 'DoktorNaDohled Medical Team'
              }
            }),
          }}
        />
      </body>
    </html>
  )
}