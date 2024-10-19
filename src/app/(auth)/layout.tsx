'use client'

import { ReactNode, useContext } from 'react'
import { ContextData } from '@/libs/provider'
import { redirect } from 'next/navigation'

export default function Layout({ children }: Readonly<{ children: ReactNode }>): ReactNode {
    const { data } = useContext(ContextData)
    if (data.authenticated) return redirect('/')
    return (
        <main className='flex items-center justify-center px-6 mx-auto h-screen'>
            <div className='w-full max-w-xl p-6 sm:p-8 rounded-lg bg-palette-background-secondary'>{children}</div>
        </main>
    )
}