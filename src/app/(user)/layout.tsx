import { ReactNode } from 'react'

export default function Layout({ children }: Readonly<{ children: ReactNode }>): ReactNode {
    return (
        <main className='flex flex-col max-w-4xl px-6 mx-auto py-10 space-y-3'>{children}</main>
    )
}