// src/GHLLocationCapture.jsx
import { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

/**
 * This component captures the GHL locationId early in the app lifecycle
 * and stores it in localStorage before any OAuth redirects happen.
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
      
      // Extract locationId from various sources
      const extractLocationId = (url) => {
        const patterns = [
          /\/location\/([a-zA-Z0-9_-]{15,40})/, 
          /\/v2\/location\/([a-zA-Z0-9_-]{15,40})/, 
          /locationId=([a-zA-Z0-9_-]{15,40})/, 
          /location=([a-zA-Z0-9_-]{15,40})/, 
          /subaccount=([a-zA-Z0-9_-]{15,40})/, 
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) {
            return match[1];
          }
        }
        return null;
      };

      // Helper to validate the ID (Not null, not a merge tag, not "undefined")
      const isValid = (id) => id && !id.includes("{{") && id !== "undefined" && id !== "null";
      
      let locationId = null;

      // 1. Try URL params first (most reliable when coming from GHL)
      locationId = searchParams.get('locationId') || 
                   searchParams.get('location') || 
                   searchParams.get('subaccount');
      
      // 2. 🔥 Check Referrer if URL params are missing
      if (!isValid(locationId)) {
        if (referrer.includes('gohighlevel.com') || referrer.includes('app.msgsndr.com')) {
          console.log('🔗 GHL Capture - Analyzing Referrer domain...');
          locationId = extractLocationId(referrer);
        }
      }

      // 3. Try extracting from current URL string directly
      if (!isValid(locationId)) {
        locationId = extractLocationId(currentUrl);
      }

      // Final Storage Logic
      if (isValid(locationId)) {
        console.log('✅ GHL Capture - Successfully stored ID:', locationId);
        localStorage.setItem('ghl_pending_locationId', locationId);
        sessionStorage.setItem('ghl_locationId', locationId);
        sessionStorage.setItem('ghl_captureTime', Date.now().toString());
      } else {
        const stored = localStorage.getItem('ghl_pending_locationId');
        if (stored) {
          console.log('📦 GHL Capture - No new ID found, using existing:', stored);
        } else {
          console.log('⚠️ GHL Capture - No locationId found in any source');
        }
      }
    };

    captureLocationId();
  }, [searchParams, location.pathname, location.search]); // Added location.search for better tracking

  return null; 
};

// --- Helper Functions ---

export const getStoredLocationId = () => {
  const locationId = localStorage.getItem('ghl_pending_locationId') || 
                     sessionStorage.getItem('ghl_locationId');
  const captureTime = sessionStorage.getItem('ghl_captureTime');
  
  // Clear if older than 5 minutes (prevents stale data across different GHL subaccounts)
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

export const setLocationId = (locationId) => {
  if (locationId && !locationId.includes("{{")) {
    localStorage.setItem('ghl_pending_locationId', locationId);
    sessionStorage.setItem('ghl_locationId', locationId);
    sessionStorage.setItem('ghl_captureTime', Date.now().toString());
  }
};