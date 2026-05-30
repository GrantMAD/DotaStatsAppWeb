import { OPENDOTA_BASE_URL } from "./constants";

export class ApiError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function fetchFromOpenDota<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${OPENDOTA_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  // Create safe options with Accept-Encoding: identity for server-side calls
  // This avoids a known Node.js 22 + Windows bug with TransformStream/Compression
  const safeOptions: RequestInit = {
    ...options,
    headers: {
      ...options?.headers,
      ...(typeof window === 'undefined' ? { 'Accept-Encoding': 'identity' } : {}),
    },
  };

  try {
    const response = await fetch(url, safeOptions);
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new ApiError('OpenDota API rate limit exceeded. Please try again later.', 429);
      }
      if (response.status === 404) {
        throw new ApiError('The requested resource was not found.', 404);
      }
      throw new ApiError(`OpenDota API error: ${response.statusText}`, response.status);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('The request timed out. Please check your connection.', 408);
    }
    
    throw new ApiError(error instanceof Error ? error.message : 'An unexpected network error occurred.');
  }
}
