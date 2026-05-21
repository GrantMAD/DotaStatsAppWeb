import { NextRequest, NextResponse } from 'next/server'

const OPEN_DOTA_BASE_URL = 'https://api.opendota.com/api'

const buildTargetUrl = (request: NextRequest, pathSegments: string[]) => {
  const targetUrl = new URL(`${OPEN_DOTA_BASE_URL}/${pathSegments.join('/')}`)
  targetUrl.search = request.nextUrl.search
  return targetUrl
}

const forwardRequest = async (request: NextRequest, pathSegments: string[]) => {
  const targetUrl = buildTargetUrl(request, pathSegments)

  const forwardedHeaders = new Headers(request.headers)
  forwardedHeaders.delete('host')

  const body = ['GET', 'HEAD'].includes(request.method)
    ? undefined
    : await request.arrayBuffer()

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: forwardedHeaders,
      body,
      redirect: 'follow',
      cache: 'no-store',
    })

    const response = new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
    })

    upstreamResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'content-encoding') return
      if (key.toLowerCase() === 'transfer-encoding') return
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    console.error('OpenDota proxy failed for', targetUrl.toString(), error)
    return new NextResponse(JSON.stringify({ error: 'OpenDota proxy failed', message: String(error) }), {
      status: 502,
      headers: {
        'content-type': 'application/json',
      },
    })
  }
}

const getParams = async (context: { params: Promise<{ opendota: string[] }> }) => {
  const params = await context.params
  return params.opendota
}

export async function GET(request: NextRequest, context: { params: Promise<{ opendota: string[] }> }) {
  return forwardRequest(request, await getParams(context))
}

export async function POST(request: NextRequest, context: { params: Promise<{ opendota: string[] }> }) {
  return forwardRequest(request, await getParams(context))
}

export async function PUT(request: NextRequest, context: { params: Promise<{ opendota: string[] }> }) {
  return forwardRequest(request, await getParams(context))
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ opendota: string[] }> }) {
  return forwardRequest(request, await getParams(context))
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ opendota: string[] }> }) {
  return forwardRequest(request, await getParams(context))
}

export async function OPTIONS(request: NextRequest, context: { params: Promise<{ opendota: string[] }> }) {
  return forwardRequest(request, await getParams(context))
}
