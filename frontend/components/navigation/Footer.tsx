import React from 'react'
import Link from 'next/link'
import { Sparkles, Github, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full bg-[#181818] border-t border-[#313131] mt-24 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Mission */}
        <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#272727] border border-[#313131] flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5 text-[#FF79C6]" />
            </div>
            <span className="title-4 text-white">Quantum Edge Vision Platform</span>
          </div>
          <p className="caption-2 max-w-sm">
            High performance comparative benchmarking for planetary orbital GeoTIFFs and quantum Hadamard edge detection.
          </p>
        </div>

        {/* Navigation & Legal Links */}
        <div className="flex flex-wrap items-center justify-center gap-5 caption-1 text-[#A1A1A1]">
          <Link href="/studio" className="hover:text-white transition-colors">
            Live Studio
          </Link>
          <Link href="/gis-explorer" className="hover:text-white transition-colors">
            3D Lunar GIS
          </Link>
          <Link href="/hardware-lab" className="hover:text-white transition-colors">
            Hardware Lab
          </Link>
          <Link href="/studio/qml-pipeline" className="hover:text-white transition-colors">
            QML Pipeline
          </Link>
          <Link href="/publish" className="hover:text-white transition-colors">
            Publication Suite
          </Link>
          <Link href="/arena" className="hover:text-white transition-colors">
            Algorithm Arena
          </Link>
          <Link href="/composer" className="hover:text-white transition-colors">
            Quantum Composer
          </Link>
          <Link href="/benchmark" className="hover:text-white transition-colors">
            Benchmarks
          </Link>
          <Link href="/architectures" className="hover:text-white transition-colors">
            Architectures
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
          <a
            href="https://github.com/SamradhSahni/Quantum_Visualization"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub
            <ExternalLink className="w-3 h-3 text-[#666666]" />
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-[#313131]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="caption-4">
          Built for scalable planetary surface analysis. Supported by Qiskit Aer Statevector Simulation.
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#39D353] animate-pulse"></span>
          <span className="caption-5 text-[#888888]">Aer Simulation Engine Online</span>
        </div>
      </div>
    </footer>
  )
}

