import { NextResponse } from 'next/server'

// Generování sitemap.xml pro SEO
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doktor-na-dohled.vercel.app'
  const currentDate = new Date().toISOString().split('T')[0]
  
  const staticPages = [
    {
      url: '',
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      url: '/vyhledavani',
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      url: '/rezervace',
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: '/chat',
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: '/telemedicina',
      changefreq: 'weekly',
      priority: '0.7'
    },
    {
      url: '/auth/login',
      changefreq: 'monthly',
      priority: '0.6'
    },
    {
      url: '/auth/register',
      changefreq: 'monthly',
      priority: '0.6'
    },
    {
      url: '/privacy',
      changefreq: 'yearly',
      priority: '0.3'
    },
    {
      url: '/terms',
      changefreq: 'yearly',
      priority: '0.3'
    }
  ]
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  })
}