import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Budget',
  description: 'Din personliga budgetapp',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={geist.variable}>
        {children}
      </body>
    </html>
  )
}
