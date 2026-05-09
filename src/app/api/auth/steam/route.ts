import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Extract the 'next' parameter if it exists, default to /settings
  const next = searchParams.get('next') || '/settings';
  
  // Create the target URL
  const targetUrl = new URL(next, req.url);
  
  // Append all openid parameters so the client can process them
  searchParams.forEach((value, key) => {
    if (key !== 'next') {
      targetUrl.searchParams.append(key, value);
    }
  });
  
  return NextResponse.redirect(targetUrl);
}
