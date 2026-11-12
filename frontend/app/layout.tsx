import type { Metadata } from 'next'
import { headers } from 'next/headers'
import 'katex/dist/katex.min.css'
import './globals.css'
import Navbar from '@/components/navigation/Navbar'
import Footer from '@/components/navigation/Footer'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'Quantum Edge Vision Platform | Quantum & Classical Edge Detection',
  description: 'Scalable Next.js and FastAPI cloud platform benchmarking FRQI, QPIE, NEQR quantum edge detection against Sobel, Canny, and Robinson on planetary lunar imagery.',
  keywords: ['Quantum Image Processing', 'FRQI', 'QPIE', 'NEQR', 'QHED', 'Edge Detection', 'Qiskit Aer', 'Planetary Lunar Analysis'],
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Forces request-time rendering so middleware per-request CSP nonces match Next.js scripts
  const nonce = headers().get('x-nonce') ?? undefined

  return (
    <html lang="en" className="dark" data-csp-nonce={nonce ? 'active' : 'off'}>
      <body className="bg-black text-[#EDEDED] antialiased min-h-screen flex flex-col font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pt-24">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
