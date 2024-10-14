import { ReactNode } from 'react'
import { Input } from '@/components/input'

export function SidebarComponent (): ReactNode {
    return (
        <div className='flex flex-col h-full border-r border-palette-background-secondary overflow-y-hidden p-5 w-[30%]'>
            <div className='mb-5'>
                <Input inputClassName='rounded-full' size='small' placeholder='Search...'/>
            </div>
            <div className='flex flex-col space-y-3 overflow-y-scroll h-full scroll-sidebar'>
                {[...Array(100)].map((_, i: number): ReactNode => (
                    <div key={i} className='flex flex-col bg-palette-background-secondary hover:bg-palette-gray-5 p-3 rounded-lg cursor-pointer transition'>
                        <div className='flex flex-row justify-between items-center mb-1'>
                            <span className='font-semibold text-sm'>Subject</span>
                            <div className='flex flex-row space-x-1'>
                                <div className='rounded-full text-xs border border-palette-gray-2 px-1.5'>Mail</div>
                                <div className='rounded-full text-xs bg-palette-success-primary px-1.5'>Open</div>
                            </div>
                        </div>
                        <span className='h-8 truncate-text text-xs text-palette-gray-2'>Comrades! The beginning of daily work on the formation of the position allows us to evaluate the importance of the forms of development. On the other hand, the realization of the planned tasks allows us to evaluate the importance of the development model. On the other hand, the existing structure of the organization requires the definition and clarification of further directions of development.</span>
                    </div>
                ))}
            </div>
        </div>
    )
}