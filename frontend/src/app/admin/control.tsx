import { ReactNode } from 'react'
import { Button } from '@/components/button'

export function ControlComponent (): ReactNode {
    return (
        <div className='flex flex-col h-full border-r border-palette-background-secondary overflow-y-hidden p-5 w-[30%]'>
            <Button>Close the ticket</Button>
        </div>
    )
}