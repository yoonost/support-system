import { ReactNode } from 'react'

export default function Layout({ children }: Readonly<{ children: ReactNode }>): ReactNode {
    return (
        <main className='flex items-center justify-center px-6 mx-auto h-screen'>
            <div className='w-full max-w-xl p-6 sm:p-8 rounded-lg bg-[#1d1e25]'>{children}</div>
        </main>
    )
}
