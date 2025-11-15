/**
 * CSRF Token management
 */

let csrfToken: string | null = null;

/**
 * Get CSRF token from meta tag or fetch from API
 */
export async function getCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  // Try to get from meta tag
  if (typeof document !== 'undefined') {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      csrfToken = metaTag.getAttribute('content') || '';
      if (csrfToken) {
        return csrfToken;
      }
    }
  }

  // Fetch from API
  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      csrfToken = data.token;
      return csrfToken || '';
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }

  return '';
}

/**
 * Set CSRF token (for server-side rendering)
 */
export function setCsrfToken(token: string): void {
  csrfToken = token;
}

/**
 * Clear CSRF token
 */
export function clearCsrfToken(): void {
  csrfToken = null;
}

/**
 * Add CSRF token to fetch request
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getCsrfToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('X-CSRF-Token', token);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

