import type { Metadata } from 'next'
import { Geist, Space_Grotesk } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['600', '700'],
})

export const metadata: Metadata = {
  title: 'Mony',
  description: 'Få koll på vart pengarna tar vägen',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${geist.variable} ${spaceGrotesk.variable}`}>
        {children}
      </body>
    </html>
  )
}
