// lib/firebase/admin.ts — lazy initialization to avoid build-time errors
import type { App } from 'firebase-admin/app'

let _adminApp: App | null = null
let _adminAuth: import('firebase-admin/auth').Auth | null = null
let _adminDb: import('firebase-admin/database').Database | null = null

function initAdmin() {
  if (_adminApp) return

  const { initializeApp, getApps, cert } = require('firebase-admin/app')

  if (getApps().length > 0) {
    _adminApp = getApps()[0]
  } else {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    _adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    })
  }

  const { getAuth } = require('firebase-admin/auth')
  const { getDatabase } = require('firebase-admin/database')
  _adminAuth = getAuth(_adminApp)
  _adminDb = getDatabase(_adminApp)
}

export function getAdminAuth(): import('firebase-admin/auth').Auth {
  initAdmin()
  return _adminAuth!
}

export function getAdminDb(): import('firebase-admin/database').Database {
  initAdmin()
  return _adminDb!
}

// Backwards compat — these are now getters
export const adminAuth = { verifyIdToken: (token: string) => getAdminAuth().verifyIdToken(token) }
export const adminDb = {
  ref: (path: string) => getAdminDb().ref(path),
}
