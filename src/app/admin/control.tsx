import { ReactNode } from 'react'
import { Button } from '@/components/button'

export function ControlComponent (): ReactNode {
    return (
        <div className='flex flex-col h-full border-r border-palette-background-secondary overflow-y-hidden w-[30%]'>
            <div className='flex flex-row items-center space-x-2 border-b border-palette-background-secondary p-5'>
                <span className='text-2xl font-semibold'>Basic information</span>
            </div>
            <div className='flex flex-col justify-between h-full p-5'>
                <div>
                    <div className='flex justify-between'>
                        <span className='text-palette-gray-2'>Created</span>
                        <span className='text-palette-gray-1'>01:07 14.10.2024</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className='text-palette-gray-2'>Platform</span>
                        <span className='text-palette-gray-1'>Telegram</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className='text-palette-gray-2'>Status</span>
                        <span className='text-palette-gray-1'>open</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className='text-palette-gray-2'>Assigned</span>
                        <span className='text-palette-gray-1'>admin</span>
                    </div>
                </div>
                <div className='space-y-3'>
                    <Button variant='success' className='w-full'>Take a ticket</Button>
                    <Button variant='warning' className='w-full'>Quit a ticket</Button>
                    <Button variant='danger' className='w-full'>Close the ticket</Button>
                </div>
            </div>
        </div>
    )

}