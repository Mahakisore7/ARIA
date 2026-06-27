import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { ModeProvider } from '@/context/ModeContext'

export const metadata: Metadata = {
  title: 'ARIA — Autonomous Rescue & Intervention Agent',
  description: "You don't manage deadlines. ARIA does.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-aria-bg text-aria-text antialiased" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
        <AuthProvider>
          <ModeProvider>
            {children}
          </ModeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
