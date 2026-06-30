import { Archivo_Black, Space_Grotesk } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { ModeProvider } from '@/context/ModeContext'

const archivoBlack = Archivo_Black({ 
  weight: '400', 
  subsets: ['latin'],
  variable: '--font-head'
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: 'ARIA — Autonomous Rescue & Intervention Agent',
  description: "You don't manage deadlines. ARIA does.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-[var(--color-neutral-primary-soft)] text-[var(--color-body)] antialiased font-sans">
        <AuthProvider>
          <ModeProvider>
            {children}
          </ModeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
