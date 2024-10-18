'use client'

import { ReactNode, useContext } from 'react'
import { redirect } from 'next/navigation'
import { ContextData } from '@/libs/provider'

export default function Layout({ children }: Readonly<{ children: ReactNode }>): ReactNode {
    const { data } = useContext(ContextData)
    if (!data.authenticated) return redirect('/sign-in')
    if (data.user.role !== 'admin') return redirect('/')
    return children
}