// src/hooks/useCurrentAccount.js
import { useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

export const useCurrentAccount = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const account = useMemo(() => {
    // Only get account from URL if on /app route
    if (location.pathname !== '/app') {
      // Try sessionStorage for non-/app routes
      const stored = sessionStorage.getItem('currentAccount');
      return stored ? JSON.parse(stored) : null;
    }

    const agencyid = searchParams.get('agencyid');
    const subaccount = searchParams.get('subaccount');
    const allow = searchParams.get('allow');
    const myname = searchParams.get('myname');
    const myemail = searchParams.get('myemail');

    if (!agencyid || !subaccount) return null;

    return {
      agencyid,
      subaccount,
      allow,
      myname: decodeURIComponent(myname || ''),
      myemail: decodeURIComponent(myemail || ''),
    };
  }, [searchParams, location.pathname]);

  return account;
};