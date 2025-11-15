/**
 * Google Analytics integration
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

/**
 * Initialize Google Analytics
 */
export function initGA(): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) {
    return;
  }

  // Load gtag script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title,
  });
}

/**
 * Track event
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

/**
 * Track conversion
 */
export function trackConversion(
  conversionId: string,
  value?: number,
  currency: string = 'IDR'
): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', 'conversion', {
    send_to: conversionId,
    value: value,
    currency: currency,
  });
}

/**
 * Track user registration (conversion funnel)
 */
export function trackRegistration(step: 'started' | 'step1' | 'step2' | 'completed'): void {
  trackEvent('registration', 'conversion_funnel', step);
}

/**
 * Track login
 */
export function trackLogin(method: 'email' | 'nik' = 'email'): void {
  trackEvent('login', 'authentication', method);
}

/**
 * Track CTA click
 */
export function trackCTAClick(ctaName: string, location: string): void {
  trackEvent('cta_click', 'engagement', `${ctaName}_${location}`);
}

/**
 * Track form submission
 */
export function trackFormSubmit(formName: string, success: boolean): void {
  trackEvent('form_submit', 'forms', formName, success ? 1 : 0);
}

