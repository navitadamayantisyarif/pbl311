'use strict';

const { OAuth2Client } = require('google-auth-library');
const logger = require('./logger');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

/**
 * Verify Google ID token
 * @param {String} idToken - Google ID token from client
 * @returns {Promise<Object>} Decoded token with user information
 */
async function verifyGoogleToken(idToken) {
  if (!GOOGLE_CLIENT_ID) {
    // In development, we might not have Google Client ID set up
    // Return a mock verification for development purposes
    logger.warn('GOOGLE_CLIENT_ID not set. Skipping token verification in development mode.');
    return {
      sub: 'mock_google_id',
      email: 'mock@example.com',
      name: 'Mock User',
      picture: 'https://via.placeholder.com/150'
    };
  }

  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      name: payload.name,
      picture: payload.picture,
      given_name: payload.given_name,
      family_name: payload.family_name
    };
  } catch (error) {
    logger.error('Google token verification error:', error);
    const err = new Error('Invalid Google ID token');
    err.code = 'INVALID_GOOGLE_TOKEN';
    throw err;
  }
}

module.exports = {
  verifyGoogleToken
};

