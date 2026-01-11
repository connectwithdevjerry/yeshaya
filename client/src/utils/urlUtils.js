// src/utils/urlUtils.js

/**
 * Extract subaccountId from URL search params
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {string|null} subaccountId or null if not found
 */
export const getSubaccountIdFromUrl = (searchParams) => {
  return searchParams.get('subaccount') || searchParams.get('subaccountId');
};

/**
 * Extract assistantId from URL route or search params
 * Handles formats like:
 * - route=/assistants/0334d312-2a09-4f15-a05b-d8ebbaf02708
 * - assistantId=0334d312-2a09-4f15-a05b-d8ebbaf02708
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {string|null} assistantId or null if not found
 */
export const getAssistantIdFromUrl = (searchParams) => {
  // Try to get from direct param first
  const directParam = searchParams.get('assistantId');
  if (directParam) return directParam;
  
  // Try to extract from route param
  const routeParam = searchParams.get('route');
  if (routeParam) {
    // Match UUID pattern in route
    const match = routeParam.match(/\/assistants\/([a-f0-9-]{36})/i);
    if (match && match[1]) return match[1];
    
    // Fallback: get last segment of route
    const segments = routeParam.split('/').filter(Boolean);
    return segments[segments.length - 1] || null;
  }
  
  return null;
};

/**
 * Extract agency ID from URL search params
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {string|null} agencyId or null if not found
 */
export const getAgencyIdFromUrl = (searchParams) => {
  return searchParams.get('agencyid') || searchParams.get('agencyId');
};

/**
 * Extract all common parameters from the URL
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {Object} Object containing extracted parameters
 */
export const extractUrlParams = (searchParams) => {
  return {
    agencyId: getAgencyIdFromUrl(searchParams),
    subaccountId: getSubaccountIdFromUrl(searchParams),
    assistantId: getAssistantIdFromUrl(searchParams),
    allow: searchParams.get('allow'),
    myName: searchParams.get('myname'),
    myEmail: searchParams.get('myemail'),
    route: searchParams.get('route')
  };
};