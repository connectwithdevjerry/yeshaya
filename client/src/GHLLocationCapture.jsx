// src/GHLLocationCapture.jsx
import { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

/**
 * This component captures the GHL locationId early in the app lifecycle
 * and stores it in localStorage before any OAuth redirects happen.
 * 
 * Place this at the TOP of your App component hierarchy.
 */
export const GHLLocationCapture = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const captureLocationId = () => {
      const currentUrl = window.location.href;
      const referrer = document.referrer;
      
      console.log('🔍 GHL Capture - Referrer:', referrer);
      console.log('🔍 GHL Capture - Current URL:', currentUrl);
      console.log('🔍 GHL Capture - Location pathname:', location.pathname);
      
      // Extract locationId from various sources
      const extractLocationId = (url) => {
        const patterns = [
          /\/location\/([a-zA-Z0-9_-]{15,30})/, // Standard: /location/ID (15-30 chars)
          /\/v2\/location\/([a-zA-Z0-9_-]{15,30})/, // V2: /v2/location/ID
          /locationId=([a-zA-Z0-9_-]{15,30})/, // Query: ?locationId=ID
          /location=([a-zA-Z0-9_-]{15,30})/, // Query: ?location=ID
          /subaccount=([a-zA-Z0-9_-]{15,30})/, // Query: ?subaccount=ID
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) {
            return match[1];
          }
        }
        return null;
      };
      
      let locationId = null;

      // 1. Try URL params first (most reliable when coming from GHL)
      locationId = searchParams.get('locationId') || 
                   searchParams.get('location') || 
                   searchParams.get('subaccount');
      
      if (locationId && !locationId.includes("{{")) {
        console.log('✅ GHL Capture - Found in URL params:', locationId);
        localStorage.setItem('ghl_pending_locationId', locationId);
        sessionStorage.setItem('ghl_locationId', locationId);
        sessionStorage.setItem('ghl_captureTime', Date.now().toString());
        return;
      }

      // 2. Try to extract from referrer (when redirected from GHL)
      if (referrer.includes('gohighlevel.com') || referrer.includes('app.msgsndr.com')) {
        locationId = extractLocationId(referrer);
        if (locationId && !locationId.includes("{{")) {
          console.log('✅ GHL Capture - Captured from referrer:', locationId);
          localStorage.setItem('ghl_pending_locationId', locationId);
          sessionStorage.setItem('ghl_locationId', locationId);
          sessionStorage.setItem('ghl_captureTime', Date.now().toString());
          return;
        }
      }
      
      // 3. Try current URL
      locationId = extractLocationId(currentUrl);
      if (locationId && !locationId.includes("{{")) {
        console.log('✅ GHL Capture - Captured from current URL:', locationId);
        localStorage.setItem('ghl_pending_locationId', locationId);
        sessionStorage.setItem('ghl_locationId', locationId);
        sessionStorage.setItem('ghl_captureTime', Date.now().toString());
        return;
      }
      
      console.log('⚠️ GHL Capture - No locationId found in any source');
      
      // Log what we have in storage
      const stored = localStorage.getItem('ghl_pending_locationId');
      if (stored) {
        console.log('📦 GHL Capture - Already have locationId in storage:', stored);
      }
    };

    captureLocationId();
  }, [searchParams, location.pathname]);

  return null; // This component doesn't render anything
};

// Helper function to use in your app
export const getStoredLocationId = () => {
  const locationId = localStorage.getItem('ghl_pending_locationId') || 
                     sessionStorage.getItem('ghl_locationId');
  const captureTime = sessionStorage.getItem('ghl_captureTime');
  
  // Clear if older than 5 minutes (to prevent stale data)
  if (captureTime && Date.now() - parseInt(captureTime) > 5 * 60 * 1000) {
    localStorage.removeItem('ghl_pending_locationId');
    sessionStorage.removeItem('ghl_locationId');
    sessionStorage.removeItem('ghl_captureTime');
    return null;
  }
  
  return locationId;
};

export const clearStoredLocationId = () => {
  localStorage.removeItem('ghl_pending_locationId');
  sessionStorage.removeItem('ghl_locationId');
  sessionStorage.removeItem('ghl_captureTime');
};

// Helper to manually set locationId (useful for testing)
export const setLocationId = (locationId) => {
  if (locationId && !locationId.includes("{{")) {
    console.log('✅ Manually setting locationId:', locationId);
    localStorage.setItem('ghl_pending_locationId', locationId);
    sessionStorage.setItem('ghl_locationId', locationId);
    sessionStorage.setItem('ghl_captureTime', Date.now().toString());
  }
};