/**
 * User Service Helpers
 * ====================
 * Small, focused functions for user operations
 */

/**
 * Standard user select for fetching data (excludes password)
 */
export const userSelect = {
  id: true,
  email: true,
  first_name: true,
  telephone_number: true,
  city: true,
  country: true,
  postal_address: true,
  gdprConsent: true,
  gdprConsentDate: true,
  marketingConsent: true,
  createdAt: true,
  role: {
    select: {
      id: true,
      libelle: true,
    },
  },
} as const;

/**
 * Transform user for API response
 */
export function transformUserResponse(user: any) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    phone: user.telephone_number,
    city: user.city,
    country: user.country,
    postalAddress: user.postal_address,
    role: user.role?.libelle ?? 'client',
    gdpr: {
      consent: user.gdprConsent,
      consentDate: user.gdprConsentDate,
      marketingConsent: user.marketingConsent,
    },
    createdAt: user.createdAt,
  };
}

/**
 * Anonymize user data for RGPD deletion
 */
export function getAnonymizedUserData() {
  const anonymousId = `deleted_${Date.now()}`;
  return {
    email: `${anonymousId}@deleted.local`,
    password: 'DELETED',
    first_name: 'Deleted User',
    telephone_number: '',
    city: '',
    country: '',
    postal_address: '',
    gdprConsent: false,
    marketingConsent: false,
  };
}
