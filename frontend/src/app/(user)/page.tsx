import { ReactNode } from 'react'
import { Link } from '@/components/link'

export default function Page(): ReactNode {
    return (
        <>
            <div className='flex flex-row items-center justify-between mb-8'>
                <h1 className='text-palette-primary text-3xl font-semibold'>Tickets</h1>
                <Link href={'/new-ticket'} variant={'primary'}>New ticket</Link>
            </div>
            <div className='flex flex-col space-y-3'>
                {[...Array(100)].map((i: number): ReactNode => (
                    <div key={i} className='flex flex-col bg-palette-background-secondary hover:bg-palette-gray-5 p-3 rounded-lg cursor-pointer transition'>
                        <div className='flex flex-row justify-between items-center mb-1'>
                            <span className='font-semibold text-sm'>Subject</span>
                            <div className='flex flex-row space-x-1'>
                                <div className='rounded-full text-xs bg-palette-success-primary px-1.5'>Open</div>
                            </div>
                        </div>
                        <span className='h-8 truncate-text text-xs text-palette-gray-2'>Comrades! The beginning of daily work on the formation of the position allows us to evaluate the importance of the forms of development. On the other hand, the realization of the planned tasks allows us to evaluate the importance of the development model. On the other hand, the existing structure of the organization requires the definition and clarification of further directions of development.</span>
                    </div>
                ))}
            </div>
        </>
    )
}