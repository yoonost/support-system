import { ReactNode } from 'react'
import { Tickets } from './tickets'

export default function Layout({ children }: Readonly<{ children: ReactNode }>): ReactNode {
    return (
        <main className='flex overflow-hidden w-full h-full'>
            <Tickets />
            {children}
        </main>
    )
}