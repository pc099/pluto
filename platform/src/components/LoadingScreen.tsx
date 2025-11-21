'use client'

import React from 'react'
import Image from 'next/image'
import MascotElle from '../../layouts/Elle.png'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-200/60 blur-3xl rounded-full opacity-70" />
        <div className="relative rounded-2xl bg-blue-100 p-4 shadow-xl border border-blue-200">
          <Image
            src={MascotElle}
            alt="Pluto is getting things ready"
            width={240}
            height={240}
            className="h-auto w-32 sm:w-40 md:w-48 animate-float"
            priority
          />
        </div>
      </div>
      <p className="text-gray-700 text-sm sm:text-base">
        Loading your Pluto workspace...
      </p>
    </div>
  )
}
