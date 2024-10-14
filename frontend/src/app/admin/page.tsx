import { ReactNode } from 'react'
import { SidebarComponent } from '@/app/admin/sidebar'
import { ChatComponent } from '@/app/admin/chat'
import { ControlComponent } from '@/app/admin/control'

export default function Page(): ReactNode {
    return (
        <main className='flex overflow-hidden w-full h-full'>
            <SidebarComponent />
            <ChatComponent />
            <ControlComponent />
        </main>
    )
}