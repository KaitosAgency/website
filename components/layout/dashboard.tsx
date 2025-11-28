'use client'

import { ReactNode } from 'react'
import { Sidebar } from './sidebar'

interface DashboardProps {
  title: string
  children: ReactNode
  headerActions?: ReactNode
  filters?: ReactNode
}

export function Dashboard({ title, children, headerActions, filters }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Contenu principal */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-semibold text-secondary">{title}</h1>
              {headerActions && (
                <div className="flex items-center gap-4">
                  {headerActions}
                </div>
              )}
            </div>
            {filters && (
              <div className="flex items-center gap-4">
                {filters}
              </div>
            )}
          </div>
        </header>

        {/* Contenu */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}



