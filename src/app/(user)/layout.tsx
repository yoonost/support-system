'use client'

import { ReactNode, useContext } from 'react'
import { redirect } from 'next/navigation'
import { ContextData } from '@/libs/provider'

export default function Layout({ children }: Readonly<{ children: ReactNode }>): ReactNode {
    const { data } = useContext(ContextData)
    if (!data.authenticated) return redirect('/sign-in')
    return (
        <main className='flex flex-col max-w-4xl px-6 mx-auto py-10 space-y-3'>{children}</main>
    )
}