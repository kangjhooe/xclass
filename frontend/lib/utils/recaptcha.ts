/**
 * reCAPTCHA v3 integration
 */

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

/**
 * Load reCAPTCHA script
 */
export function loadRecaptcha(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'));
      return;
    }

    if (window.grecaptcha) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    document.head.appendChild(script);
  });
}

/**
 * Execute reCAPTCHA and get token
 */
export async function executeRecaptcha(action: string): Promise<string> {
  if (!RECAPTCHA_SITE_KEY) {
    console.warn('reCAPTCHA site key not configured');
    return '';
  }

  await loadRecaptcha();

  return new Promise((resolve, reject) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action })
        .then((token) => {
          resolve(token);
        })
        .catch((error) => {
          console.error('reCAPTCHA execution failed:', error);
          reject(error);
        });
    });
  });
}

/**
 * Hook for using reCAPTCHA in forms
 */
export function useRecaptcha() {
  const getToken = async (action: string) => {
    try {
      return await executeRecaptcha(action);
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      return '';
    }
  };

  return { getToken };
}

