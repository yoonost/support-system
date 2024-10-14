import { Metadata } from 'next'
import { ReactNode } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { cn } from '@/libs/utils'
import '@/styles/globals.css'

export const metadata: Metadata = {
    title: 'Support System'
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>): ReactNode {
    return (
        <html lang='en'>
            <body className={cn(GeistSans.variable, GeistMono.variable)}>{children}</body>
        </html>
    )
}