import { ReactNode } from 'react'
import { Link } from '@/components/link'
import {cn} from "@/libs/utils";
import {Button} from "@/components/button";
import {Textarea} from "@/components/textarea";

export default function Page(): ReactNode {
    return (
        <>
            <div className='flex flex-row items-center justify-between mb-8'>
                <div className='flex flex-row items-center space-x-2'>
                    <span className='text-3xl font-semibold'>Subject</span>
                    <span className='text-xl text-palette-gray-2'>(# 5452)</span>
                </div>
                <Link href={'/'} variant={'primary'}>Back to home</Link>
            </div>
            <div className='bg-palette-background-secondary rounded-lg divide-palette-gray-5 divide-y'>
                <div className='p-4'>
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
                <div className='p-4'>
                    <form className='flex flex-col space-y-3 py-5'>
                        <Textarea divClassname='w-full' inputClassName='w-full' size='small' placeholder='Enter a message...' />
                        <div className={'flex justify-end space-x-3'}>
                            <Button variant='danger'>Close the ticket</Button>
                            <Button>Send</Button>
                        </div>
                    </form>
                </div>
            </div>


            <div className='flex flex-col space-y-3 overflow-y-scroll scroll-sidebar p-5 h-full'>
                {[...Array(3)].map((_, i: number): ReactNode => {
                    const type: boolean = Math.random() < 0.5
                    return (
                        <div className={cn('flex items-end', type && 'justify-end')} key={i}>
                            <div className={cn('flex flex-col max-w-[50%]', type && 'items-end')}>
                                <div
                                    className={cn('flex flex-row items-center gap-x-1 mb-1 flex-wrap', type && 'flex-row-reverse')}>
                                    <span className='text-palette-gray-1'>admin@gmail.com</span>
                                    <span className='text-palette-gray-3 text-xs'>0:37 14.10.2024</span>
                                </div>
                                <div
                                    className={cn('bg-palette-gray-5 px-3 py-2 rounded-lg', type && 'bg-palette-default-primary')}>
                                    <span className='text-sm text-palette-gray-1'>Comrades! ition and clarification of further directions of development.Comrades! ition and clarification of further directions of development.Comrades! ition and clarification of further directions of development.Comrades! ition and clarification of further directions of development.Comrades! ition and clarification of further directions of development.Comrades! ition and clarification of further directions of development.Comrades! ition and clarification of further directions of development.Comrades! ition and clarification of further directions of development.Comrades! ition and clarification of further directions of development.Comrades! ition and clarification of further directions of development.Comrades! ition and clarification of further directions of development.Comrades! ition and clarification of further directions of development.Comrades! ition and clarification of further directions of development.Comrades! ition and clarification of further directions of development.Comrades! ition and clarification of further directions of development.</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}