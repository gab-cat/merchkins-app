"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorFallbackProps {
  error?: Error
  resetError: () => void
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const router = useRouter()

  return (
    <div className="min-h-[500px] flex items-center justify-center p-8">
      <div className="relative max-w-md w-full">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-2xl opacity-50 animate-pulse" />
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-red-400 to-orange-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s' }} />
        
        {/* Main content */}
        <div className="relative bg-white/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-8 shadow-xl">
          {/* Icon with animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-lg opacity-30 animate-pulse" />
              <div className="relative bg-gradient-to-r from-red-500 to-orange-500 p-4 rounded-full">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Error message */}
          <div className="text-center space-y-3 mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Oops! Something broke
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We encountered an unexpected error. Don&apos;t worry, it&apos;s not your fault. 
              Let&apos;s get you back on track.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button 
              onClick={resetError} 
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Try Again
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => router.back()} 
                variant="outline" 
                className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              
              <Button 
                onClick={() => router.push('/')} 
                variant="outline" 
                className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </div>
          </div>

          {/* Error code (if available) */}
          {error?.message && (
            <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 font-mono break-all">
                Error: {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Floating particles */}
        <div className="absolute top-0 left-1/4 w-2 h-2 bg-red-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.2s' }} />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-orange-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.7s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '1.2s' }} />
      </div>
    </div>
  )
}
