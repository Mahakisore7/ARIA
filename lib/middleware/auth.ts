// lib/middleware/auth.ts
import { adminAuth } from '@/lib/firebase/admin'

export async function verifyToken(req: Request): Promise<string> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid Authorization header')
  }
  const token = authHeader.split('Bearer ')[1]
  const decoded = await adminAuth.verifyIdToken(token)
  return decoded.uid
}
