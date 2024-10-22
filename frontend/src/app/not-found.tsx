import { ReactNode } from 'react'
import { TbError404 } from 'react-icons/tb'

export default function NotFound(): ReactNode {
    return (
        <div className='flex flex-col items-center justify-center mx-auto h-screen'>
            <TbError404 className='w-20 h-auto text-palette-gray-1' />
            <div className='flex flex-col items-center space-y-2'>
                <h1 className='text-2xl text-palette-gray-1 font-bold'>Not Found</h1>
                <span className='text-md text-palette-gray-2'>Could not find requested resource</span>
            </div>
        </div>
    )
}