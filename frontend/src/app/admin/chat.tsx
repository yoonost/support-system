import {ReactNode} from "react";
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { cn } from '@/libs/utils'

export function ChatComponent (): ReactNode {
    return (
        <div className='flex flex-col h-full border-r border-palette-background-secondary overflow-y-hidden w-full'>
            <div className='flex flex-row items-center space-x-2 border-b border-palette-background-secondary mb-5 p-5'>
                <span className='text-2xl font-semibold'>Subject</span>
                <span className='text-xl text-palette-gray-2'>(# 5452)</span>
            </div>
            <div className='flex flex-col space-y-3 overflow-y-scroll scroll-sidebar p-5 h-full'>
                {[...Array(3)].map((i: number): ReactNode => {
                    const type: boolean = Math.random() < 0.5
                    return (
                        <div className={cn("flex items-end", type && 'justify-end')} key={i}>
                            <div className={cn('bg-palette-gray-5 px-2 rounded-lg', type && 'bg-palette-default-primary' )}>
                                <span className='text-sm text-palette-gray-1'>Comrades! ition and clarification of further directions of development.</span>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className='flex flex-row flex-1 space-x-3 p-5'>
                <Input divClassname='w-full' inputClassName='rounded-full w-full' size='small' placeholder='Search...'/>
                <Button className='rounded-full'>Send</Button>
            </div>
        </div>
    )
}