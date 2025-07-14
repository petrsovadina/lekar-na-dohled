import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Health check endpoint pro monitoring a deployment
export async function GET() {
  const startTime = Date.now()
  
  try {
    // Kontrola Supabase připojení
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data, error } = await supabase
      .from('doctors')
      .select('count')
      .limit(1)
    
    const dbStatus = error ? 'unhealthy' : 'healthy'
    const dbLatency = Date.now() - startTime
    
    // Kontrola OpenAI API
    let aiStatus = 'healthy'
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        signal: AbortSignal.timeout(5000)
      })
      aiStatus = response.ok ? 'healthy' : 'unhealthy'
    } catch {
      aiStatus = 'unhealthy'
    }
    
    const totalLatency = Date.now() - startTime
    const isHealthy = dbStatus === 'healthy' && aiStatus === 'healthy'
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      region: process.env.VERCEL_REGION || 'unknown',
      services: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
          provider: 'supabase'
        },
        ai: {
          status: aiStatus,
          provider: 'openai'
        }
      },
      performance: {
        totalLatency: `${totalLatency}ms`,
        memoryUsage: process.memoryUsage ? {
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        } : null
      },
      features: {
        chat: 'enabled',
        booking: 'enabled',
        telemedicine: 'enabled',
        gdpr: 'enabled'
      }
    }
    
    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      latency: `${Date.now() - startTime}ms`
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })
  }
}