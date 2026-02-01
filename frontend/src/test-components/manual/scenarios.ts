/**
 * Manual Test Scenarios
 * Predefined user flows for interactive testing
 */

import type { ManualTestScenario } from './types';

export const manualTestScenarios: ManualTestScenario[] = [
  // ============ AUTH SCENARIOS ============
  {
    id: 'register-new-user',
    name: 'Register New Account',
    description: 'Create a new user account with email and password',
    category: 'auth',
    icon: '👤',
    steps: [
      {
        id: 'register-form',
        name: 'Fill Registration Form',
        description: 'Enter user details for registration',
        type: 'form',
        config: {
          fields: [
            {
              name: 'email',
              label: 'Email Address',
              type: 'email',
              placeholder: 'user@example.com',
              required: true,
              validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' }
            },
            {
              name: 'password',
              label: 'Password',
              type: 'password',
              placeholder: 'Min 8 characters',
              required: true,
              validation: { minLength: 8 }
            },
            {
              name: 'firstName',
              label: 'First Name',
              type: 'text',
              placeholder: 'John',
              required: true
            },
            {
              name: 'telephoneNumber',
              label: 'Phone (optional)',
              type: 'text',
              placeholder: '+33 6 12 34 56 78',
              required: false
            }
          ]
        }
      },
      {
        id: 'submit-register',
        name: 'Submit Registration',
        description: 'Send registration request to API',
        type: 'api-call',
        config: {
          endpoint: '/auth/register',
          method: 'POST'
        }
      },
      {
        id: 'verify-user-created',
        name: 'Verify User in Database',
        description: 'Check that user was created in PostgreSQL',
        type: 'display',
        config: {
          displayType: 'table'
        }
      }
    ]
  },
  {
    id: 'login-user',
    name: 'Login User',
    description: 'Authenticate with email and password',
    category: 'auth',
    icon: '🔐',
    steps: [
      {
        id: 'login-form',
        name: 'Fill Login Form',
        description: 'Enter credentials',
        type: 'form',
        config: {
          fields: [
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              placeholder: 'user@example.com',
              required: true,
              defaultValue: 'testuser@example.com'
            },
            {
              name: 'password',
              label: 'Password',
              type: 'password',
              placeholder: 'Password',
              required: true,
              defaultValue: 'password123'
            }
          ]
        }
      },
      {
        id: 'submit-login',
        name: 'Submit Login',
        description: 'Authenticate and receive tokens',
        type: 'api-call',
        config: {
          endpoint: '/auth/login',
          method: 'POST'
        }
      },
      {
        id: 'show-tokens',
        name: 'Show Auth Tokens',
        description: 'Display received access and refresh tokens',
        type: 'display',
        config: {
          displayType: 'json'
        }
      }
    ]
  },
  {
    id: 'change-password',
    name: 'Change Password',
    description: 'Update user password (requires login first)',
    category: 'auth',
    icon: '🔑',
    steps: [
      {
        id: 'password-form',
        name: 'Enter New Password',
        description: 'Current password and new password',
        type: 'form',
        config: {
          fields: [
            {
              name: 'currentPassword',
              label: 'Current Password',
              type: 'password',
              required: true
            },
            {
              name: 'newPassword',
              label: 'New Password',
              type: 'password',
              required: true,
              validation: { minLength: 8 }
            },
            {
              name: 'confirmPassword',
              label: 'Confirm New Password',
              type: 'password',
              required: true
            }
          ]
        }
      },
      {
        id: 'submit-password-change',
        name: 'Submit Password Change',
        description: 'Update password via API',
        type: 'api-call',
        config: {
          endpoint: '/auth/change-password',
          method: 'POST'
        }
      },
      {
        id: 'retry-login',
        name: 'Retry Login with New Password',
        description: 'Verify new password works',
        type: 'button',
        config: {
          buttonText: 'Try Login with New Password',
          buttonAction: 'retry-login'
        }
      }
    ]
  },
  {
    id: 'invalid-login-attempts',
    name: 'Invalid Login Edge Cases',
    description: 'Test login with invalid credentials',
    category: 'auth',
    icon: '⚠️',
    steps: [
      {
        id: 'edge-case-select',
        name: 'Select Edge Case',
        description: 'Choose which invalid login to test',
        type: 'select',
        config: {
          options: [
            { value: 'wrong-password', label: 'Wrong Password' },
            { value: 'wrong-email', label: 'Non-existent Email' },
            { value: 'empty-password', label: 'Empty Password' },
            { value: 'empty-email', label: 'Empty Email' },
            { value: 'sql-injection', label: 'SQL Injection Attempt' },
            { value: 'xss-attempt', label: 'XSS Attempt' }
          ]
        }
      },
      {
        id: 'run-edge-case',
        name: 'Execute Edge Case',
        description: 'Send the malformed request',
        type: 'api-call',
        config: {
          endpoint: '/auth/login',
          method: 'POST'
        }
      },
      {
        id: 'verify-security',
        name: 'Verify Security Response',
        description: 'Check that API handled it securely',
        type: 'display',
        config: {
          displayType: 'json'
        }
      }
    ]
  },

  // ============ USER SCENARIOS ============
  {
    id: 'update-profile',
    name: 'Update User Profile',
    description: 'Modify user profile information',
    category: 'user',
    icon: '✏️',
    steps: [
      {
        id: 'profile-form',
        name: 'Edit Profile',
        description: 'Update user details',
        type: 'form',
        config: {
          fields: [
            {
              name: 'firstName',
              label: 'First Name',
              type: 'text',
              required: true
            },
            {
              name: 'lastName',
              label: 'Last Name',
              type: 'text',
              required: true
            },
            {
              name: 'phone',
              label: 'Phone Number',
              type: 'text',
              placeholder: '+33 6 12 34 56 78'
            }
          ]
        }
      },
      {
        id: 'submit-profile',
        name: 'Save Profile',
        description: 'Update profile via API',
        type: 'api-call',
        config: {
          endpoint: '/users/me',
          method: 'PATCH'
        }
      },
      {
        id: 'show-db-update',
        name: 'View Database Change',
        description: 'See the updated user record',
        type: 'display',
        config: {
          displayType: 'table'
        }
      }
    ]
  },
  {
    id: 'set-dietary-preferences',
    name: 'Set Dietary Preferences',
    description: 'Configure allergens and diet preferences',
    category: 'user',
    icon: '🥗',
    steps: [
      {
        id: 'load-allergens',
        name: 'Load Available Allergens',
        description: 'Fetch allergen list from API',
        type: 'api-call',
        config: {
          endpoint: '/allergens',
          method: 'GET'
        }
      },
      {
        id: 'select-allergens',
        name: 'Select Allergens',
        description: 'Choose your allergens',
        type: 'toggle',
        config: {}
      },
      {
        id: 'save-preferences',
        name: 'Save Preferences',
        description: 'Update user preferences',
        type: 'api-call',
        config: {
          endpoint: '/users/me/preferences',
          method: 'PUT'
        }
      }
    ]
  },

  // ============ ORDER SCENARIOS ============
  {
    id: 'create-order',
    name: 'Create New Order',
    description: 'Build and submit an order',
    category: 'order',
    icon: '🛒',
    steps: [
      {
        id: 'load-menu',
        name: 'Load Today\'s Menu',
        description: 'Fetch available dishes',
        type: 'api-call',
        config: {
          endpoint: '/menus/today',
          method: 'GET'
        }
      },
      {
        id: 'select-dishes',
        name: 'Select Dishes',
        description: 'Add dishes to order',
        type: 'toggle',
        config: {}
      },
      {
        id: 'set-quantity',
        name: 'Set Quantities',
        description: 'Adjust dish quantities',
        type: 'slider',
        config: {}
      },
      {
        id: 'submit-order',
        name: 'Submit Order',
        description: 'Create order via API',
        type: 'api-call',
        config: {
          endpoint: '/orders',
          method: 'POST'
        }
      },
      {
        id: 'show-order-db',
        name: 'View Order in Database',
        description: 'See order record created',
        type: 'display',
        config: {
          displayType: 'table'
        }
      }
    ]
  },
  {
    id: 'track-order',
    name: 'Track Order Status',
    description: 'View and update order status',
    category: 'order',
    icon: '📦',
    steps: [
      {
        id: 'load-orders',
        name: 'Load My Orders',
        description: 'Fetch user orders',
        type: 'api-call',
        config: {
          endpoint: '/orders/me',
          method: 'GET'
        }
      },
      {
        id: 'select-order',
        name: 'Select Order',
        description: 'Choose order to track',
        type: 'select',
        config: {
          options: []  // Dynamic - filled at runtime
        }
      },
      {
        id: 'show-status',
        name: 'Show Order Details',
        description: 'Display order status and items',
        type: 'display',
        config: {
          displayType: 'json'
        }
      }
    ]
  },

  // ============ PAYMENT SCENARIOS ============
  {
    id: 'process-payment',
    name: 'Process Payment',
    description: 'Complete payment for an order',
    category: 'payment',
    icon: '💳',
    steps: [
      {
        id: 'select-order-to-pay',
        name: 'Select Order',
        description: 'Choose order to pay',
        type: 'select',
        config: {
          options: []
        }
      },
      {
        id: 'payment-form',
        name: 'Enter Payment Details',
        description: 'Fill credit card information',
        type: 'form',
        config: {
          fields: [
            {
              name: 'cardNumber',
              label: 'Card Number',
              type: 'text',
              placeholder: '4242 4242 4242 4242',
              required: true,
              defaultValue: '4242424242424242'
            },
            {
              name: 'expiryDate',
              label: 'Expiry Date',
              type: 'text',
              placeholder: 'MM/YY',
              required: true,
              defaultValue: '12/28'
            },
            {
              name: 'cvv',
              label: 'CVV',
              type: 'text',
              placeholder: '123',
              required: true,
              defaultValue: '123'
            },
            {
              name: 'cardholderName',
              label: 'Cardholder Name',
              type: 'text',
              placeholder: 'John Doe',
              required: true
            }
          ]
        }
      },
      {
        id: 'submit-payment',
        name: 'Process Payment',
        description: 'Submit payment to API',
        type: 'api-call',
        config: {
          endpoint: '/payments',
          method: 'POST'
        }
      },
      {
        id: 'show-payment-result',
        name: 'Payment Result',
        description: 'Display payment confirmation',
        type: 'display',
        config: {
          displayType: 'json'
        }
      },
      {
        id: 'show-order-update',
        name: 'View Order Status Update',
        description: 'See order marked as paid in DB',
        type: 'display',
        config: {
          displayType: 'table'
        }
      }
    ]
  },
  {
    id: 'payment-edge-cases',
    name: 'Payment Edge Cases',
    description: 'Test payment failures and edge cases',
    category: 'payment',
    icon: '🚫',
    steps: [
      {
        id: 'select-edge-case',
        name: 'Select Test Case',
        description: 'Choose payment scenario to test',
        type: 'select',
        config: {
          options: [
            { value: 'declined', label: 'Declined Card (4000000000000002)' },
            { value: 'insufficient', label: 'Insufficient Funds (4000000000009995)' },
            { value: 'expired', label: 'Expired Card' },
            { value: 'invalid-cvv', label: 'Invalid CVV' },
            { value: 'invalid-number', label: 'Invalid Card Number' }
          ]
        }
      },
      {
        id: 'run-payment-test',
        name: 'Process Test Payment',
        description: 'Execute the test scenario',
        type: 'api-call',
        config: {
          endpoint: '/payments',
          method: 'POST'
        }
      },
      {
        id: 'verify-error-handling',
        name: 'Verify Error Handling',
        description: 'Check proper error response',
        type: 'display',
        config: {
          displayType: 'json'
        }
      }
    ]
  },

  // ============ MENU SCENARIOS ============
  {
    id: 'browse-menu',
    name: 'Browse Menu',
    description: 'View and filter menu items',
    category: 'menu',
    icon: '📋',
    steps: [
      {
        id: 'load-menus',
        name: 'Load All Menus',
        description: 'Fetch menu data',
        type: 'api-call',
        config: {
          endpoint: '/menus',
          method: 'GET'
        }
      },
      {
        id: 'filter-options',
        name: 'Apply Filters',
        description: 'Filter by category, allergens, etc.',
        type: 'form',
        config: {
          fields: [
            {
              name: 'category',
              label: 'Category',
              type: 'text',
              placeholder: 'starter, main, dessert'
            },
            {
              name: 'maxPrice',
              label: 'Max Price',
              type: 'number'
            },
            {
              name: 'vegetarian',
              label: 'Vegetarian Only',
              type: 'text',
              placeholder: 'true/false'
            }
          ]
        }
      },
      {
        id: 'show-filtered',
        name: 'Show Results',
        description: 'Display filtered menu items',
        type: 'display',
        config: {
          displayType: 'table'
        }
      }
    ]
  },
  {
    id: 'view-dish-details',
    name: 'View Dish Details',
    description: 'Get detailed dish information with allergens',
    category: 'menu',
    icon: '🍽️',
    steps: [
      {
        id: 'load-dishes',
        name: 'Load Available Dishes',
        description: 'Fetch all dishes',
        type: 'api-call',
        config: {
          endpoint: '/dishes',
          method: 'GET'
        }
      },
      {
        id: 'select-dish',
        name: 'Select Dish',
        description: 'Choose a dish to view',
        type: 'select',
        config: {
          options: []
        }
      },
      {
        id: 'show-dish-detail',
        name: 'Show Dish Details',
        description: 'Display full dish information',
        type: 'display',
        config: {
          displayType: 'json'
        }
      }
    ]
  },

  // ============ ADMIN SCENARIOS ============
  {
    id: 'admin-create-dish',
    name: '[Admin] Create Dish',
    description: 'Add a new dish to the menu',
    category: 'admin',
    icon: '➕',
    steps: [
      {
        id: 'dish-form',
        name: 'Fill Dish Details',
        description: 'Enter new dish information',
        type: 'form',
        config: {
          fields: [
            {
              name: 'name',
              label: 'Dish Name',
              type: 'text',
              required: true,
              placeholder: 'Grilled Salmon'
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              placeholder: 'Delicious grilled salmon with herbs...'
            },
            {
              name: 'price',
              label: 'Price (€)',
              type: 'number',
              required: true
            },
            {
              name: 'category',
              label: 'Category',
              type: 'text',
              placeholder: 'main'
            }
          ]
        }
      },
      {
        id: 'submit-dish',
        name: 'Create Dish',
        description: 'Submit dish to API',
        type: 'api-call',
        config: {
          endpoint: '/dishes',
          method: 'POST'
        }
      },
      {
        id: 'show-db-dish',
        name: 'View in Database',
        description: 'See dish record created',
        type: 'display',
        config: {
          displayType: 'table'
        }
      }
    ]
  },
  {
    id: 'admin-view-orders',
    name: '[Admin] View All Orders',
    description: 'See all orders in the system',
    category: 'admin',
    icon: '📊',
    steps: [
      {
        id: 'load-all-orders',
        name: 'Load All Orders',
        description: 'Fetch all orders (admin)',
        type: 'api-call',
        config: {
          endpoint: '/admin/orders',
          method: 'GET'
        }
      },
      {
        id: 'filter-orders',
        name: 'Filter Orders',
        description: 'Filter by status, date, etc.',
        type: 'form',
        config: {
          fields: [
            {
              name: 'status',
              label: 'Status',
              type: 'text',
              placeholder: 'pending, confirmed, completed'
            },
            {
              name: 'dateFrom',
              label: 'From Date',
              type: 'text',
              placeholder: 'YYYY-MM-DD'
            },
            {
              name: 'dateTo',
              label: 'To Date',
              type: 'text',
              placeholder: 'YYYY-MM-DD'
            }
          ]
        }
      },
      {
        id: 'show-orders-table',
        name: 'Show Orders',
        description: 'Display orders in table',
        type: 'display',
        config: {
          displayType: 'table'
        }
      }
    ]
  }
];

export const getScenariosByCategory = (category: string): ManualTestScenario[] => {
  return manualTestScenarios.filter(s => s.category === category);
};

export const getScenarioById = (id: string): ManualTestScenario | undefined => {
  return manualTestScenarios.find(s => s.id === id);
};

export const categories = [
  { id: 'auth', name: 'Authentication', icon: '🔐' },
  { id: 'user', name: 'User Profile', icon: '👤' },
  { id: 'order', name: 'Orders', icon: '🛒' },
  { id: 'payment', name: 'Payments', icon: '💳' },
  { id: 'menu', name: 'Menu & Dishes', icon: '📋' },
  { id: 'admin', name: 'Admin', icon: '⚙️' }
];
