// src/components/GHLLocationCapture.jsx
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * This component captures the GHL locationId early in the app lifecycle
 * and stores it in sessionStorage before any OAuth redirects happen.
 * 
 * Place this at the TOP of your App component hierarchy.
 */
export const GHLLocationCapture = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const captureLocationId = () => {
      const currentUrl = window.location.href;
      const referrer = document.referrer;
      
      console.log('🔍 GHL Capture - Referrer:', referrer);
      console.log('🔍 GHL Capture - Current URL:', currentUrl);
      
      // Check if we're coming from GHL
      const isFromGHL = referrer.includes('app.gohighlevel.com') || 
                        currentUrl.includes('gohighlevel.com');
      
      if (!isFromGHL) return;

      // Extract locationId from various sources
      const extractLocationId = (url) => {
        const patterns = [
          /\/location\/([a-zA-Z0-9_-]{15,25})/, // Standard: /location/ID (15-25 chars)
          /\/v2\/location\/([a-zA-Z0-9_-]{15,25})/, // V2: /v2/location/ID
          /locationId=([a-zA-Z0-9_-]{15,25})/, // Query: ?locationId=ID
          /location=([a-zA-Z0-9_-]{15,25})/, // Query: ?location=ID
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) {
            return match[1];
          }
        }
        return null;
      };
      
      // Try to extract from referrer first (most reliable)
      let locationId = extractLocationId(referrer);
      
      // Try current URL
      if (!locationId) {
        locationId = extractLocationId(currentUrl);
      }
      
      // Check URL params
      if (!locationId) {
        locationId = searchParams.get('locationId') || 
                     searchParams.get('location') || 
                     searchParams.get('subaccount');
      }
      
      if (locationId) {
        console.log('✅ GHL Capture - Captured locationId:', locationId);
        sessionStorage.setItem('ghl_locationId', locationId);
        sessionStorage.setItem('ghl_captureTime', Date.now().toString());
      } else {
        console.log('⚠️ GHL Capture - No locationId found');
      }
    };

    captureLocationId();
  }, [searchParams]);

  return null; // This component doesn't render anything
};

// Helper function to use in your app
export const getStoredLocationId = () => {
  const locationId = sessionStorage.getItem('ghl_locationId');
  const captureTime = sessionStorage.getItem('ghl_captureTime');
  
  // Clear if older than 5 minutes (to prevent stale data)
  if (captureTime && Date.now() - parseInt(captureTime) > 5 * 60 * 1000) {
    sessionStorage.removeItem('ghl_locationId');
    sessionStorage.removeItem('ghl_captureTime');
    return null;
  }
  
  return locationId;
};

export const clearStoredLocationId = () => {
  sessionStorage.removeItem('ghl_locationId');
  sessionStorage.removeItem('ghl_captureTime');
};