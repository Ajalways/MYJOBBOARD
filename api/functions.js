// Payment and webhook functions
// Removed base44 dependency - using direct API calls

import { apiClient } from './client.js';

export const createCheckoutSession = async (priceId, customerId, metadata = {}) => {
  try {
    // Call backend to create a Stripe checkout session
    const response = await apiClient.post('/payments/create-checkout-session', {
      priceId,
      customerId,
      metadata
    });
    return response.data;
  } catch (error) {
    console.error('Checkout Session Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const stripeWebhook = async (event) => {
  try {
    // Handle Stripe webhook events
    const response = await apiClient.post('/payments/webhook', event);
    return response.data;
  } catch (error) {
    console.error('Webhook Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

