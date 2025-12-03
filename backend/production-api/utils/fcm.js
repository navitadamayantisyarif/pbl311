'use strict';

const admin = require('firebase-admin');
const fs = require('fs');

let initialized = false;

function init() {
  if (initialized) return;
  let serviceAccount = null;
  const credPath = process.env.FIREBASE_CREDENTIALS_PATH;
  if (credPath && fs.existsSync(credPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  } else if (process.env.FIREBASE_CREDENTIALS_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
  }

  if (serviceAccount) {
    if (!serviceAccount.project_id || typeof serviceAccount.project_id !== 'string') {
      throw new Error('Invalid Firebase service account: missing project_id');
    }
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    initialized = true;
    return;
  }

  try {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    initialized = true;
  } catch (_) {
    initialized = false;
  }
}

async function sendToToken(token, payload) {
  init();
  if (!initialized) throw new Error('FCM not initialized');
  return await admin.messaging().send({ token, notification: payload });
}

async function sendToTokens(tokens, payload) {
  init();
  if (!initialized) throw new Error('FCM not initialized');
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return { successCount: 0, failureCount: 0, responses: [] };
  }
  try {
    const message = { notification: payload, tokens };
    const res = await admin.messaging().sendMulticast(message);
    return res;
  } catch (_) {
    const responses = [];
    let successCount = 0;
    let failureCount = 0;
    for (const t of tokens) {
      try {
        const id = await admin.messaging().send({ token: t, notification: payload });
        responses.push({ messageId: id, success: true, token: t });
        successCount++;
      } catch (e) {
        responses.push({ error: e, success: false, token: t });
        failureCount++;
      }
    }
    return { successCount, failureCount, responses, fallback: true };
  }
}

module.exports = { init, sendToToken, sendToTokens };
