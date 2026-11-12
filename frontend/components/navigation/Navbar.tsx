'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Menu, X, ArrowRight, ShieldCheck, LogOut, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Overview', href: '/' },
    { name: 'Live Studio', href: '/studio' },
    { name: '3D GIS', href: '/gis-explorer' },
    { name: 'Hardware Lab', href: '/hardware-lab' },
    { name: 'QML Pipeline', href: '/studio/qml-pipeline' },
    { name: 'Publish', href: '/publish' },
    { name: 'Arena', href: '/arena' },
    { name: 'Composer', href: '/composer' },
    { name: 'Benchmarks', href: '/benchmark' },
  ]

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 pointer-events-none">
      <nav className="max-w-7xl mx-auto bg-[#181818]/90 backdrop-blur-md border border-[#313131] rounded-2xl px-4 py-2 flex items-center justify-between shadow-2xl pointer-events-auto transition-all duration-300">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#272727] border border-[#313131] flex items-center justify-center text-white group-hover:border-[#FF79C6] transition-colors duration-300">
            <Sparkles className="w-4 h-4 text-[#FF79C6]" />
          </div>
          <div className="flex flex-col">
            <span className="title-4 text-white tracking-tight">Quantum Vision</span>
            <span className="caption-5 text-[#888888] font-mono">QED Studio</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden xl:flex items-center gap-0.5 bg-[#1F1F1F] px-1.5 py-1 rounded-xl border border-[#313131]/60">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#272727] text-white shadow-sm font-semibold'
                    : 'text-[#A1A1A1] hover:text-white hover:bg-[#272727]/50'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </div>

        {/* Desktop Auth / Action */}
        <div className="hidden xl:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="caption-2 text-[#00F0FF] flex items-center gap-1 bg-[#1F1F1F] px-2.5 py-1 rounded-lg border border-[#313131] hover:border-[#00F0FF]"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
              <span className="caption-2 text-[#A1A1A1] flex items-center gap-1.5 bg-[#1F1F1F] px-2.5 py-1 rounded-lg border border-[#313131]">
                <User className="w-3.5 h-3.5 text-[#00F0FF]" />
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={() => void logout()}
                title="Sign out"
                className="p-1.5 text-[#888888] hover:text-white bg-[#1F1F1F] hover:bg-[#272727] rounded-lg border border-[#313131] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
              <Link
                href="/studio"
                className="button-sm bg-[#272727] hover:bg-[#313131] text-white border border-[#313131] rounded-lg transition-all active:scale-[0.98] flex items-center gap-1.5"
              >
                Studio
                <ArrowRight className="w-3.5 h-3.5 text-[#FF79C6]" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="title-5 text-[#A1A1A1] hover:text-white px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/studio"
                className="button-sm bg-white text-black hover:bg-[#E5E5E5] rounded-lg transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm"
              >
                Launch Studio
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-1.5 text-[#A1A1A1] hover:text-white bg-[#1F1F1F] rounded-lg border border-[#313131]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden mt-2 max-w-7xl mx-auto bg-[#181818] border border-[#313131] rounded-2xl p-4 shadow-2xl pointer-events-auto flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="title-4 text-[#A1A1A1] hover:text-white p-2.5 rounded-lg hover:bg-[#1F1F1F] transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#313131] flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <span className="caption-1 text-white">{user?.email}</span>
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="caption-2 text-red-400 hover:text-red-300"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="button-md text-center text-[#A1A1A1] hover:text-white bg-[#1F1F1F] rounded-lg border border-[#313131]"
              >
                Sign in / Create Account
              </Link>
            )}
            <Link
              href="/studio"
              onClick={() => setMobileMenuOpen(false)}
              className="button-md text-center bg-white text-black font-semibold rounded-lg"
            >
              Launch Quantum Studio
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

