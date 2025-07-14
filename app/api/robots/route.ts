import { NextResponse } from 'next/server'

// Generování robots.txt pro web crawlery
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doktor-na-dohled.vercel.app'
  
  const robots = `User-agent: *
Allow: /
Allow: /vyhledavani
Allow: /chat
Allow: /telemedicina
Allow: /auth/login
Allow: /auth/register

# Zakázané cesty
Disallow: /api/
Disallow: /dashboard/
Disallow: /rezervace/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

# Crawl delay pro zdvořilost
Crawl-delay: 1

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Specifické pravidla pro různé boty
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

User-agent: facebookexternalhit
Allow: /
Allow: /vyhledavani
Allow: /chat

User-agent: Twitterbot
Allow: /
Allow: /vyhledavani
Allow: /chat

# Seznam.cz crawler
User-agent: SeznamBot
Allow: /
Crawl-delay: 2

# Blokování špam botů
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: BLEXBot
Disallow: /`

  return new Response(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  })
}