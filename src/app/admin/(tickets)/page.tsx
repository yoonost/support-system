import { ReactNode } from 'react'
import { TbZoomExclamation } from 'react-icons/tb'

export default function Page(): ReactNode {
    return (
        <div className='flex flex-col items-center justify-center mx-auto h-screen'>
            <TbZoomExclamation className='w-20 h-auto text-palette-gray-1'/>
            <div className='flex flex-col items-center mt-2'>
                <h1 className='text-lg text-palette-gray-1 font-medium'>To get started, select a ticket</h1>
            </div>
        </div>
    )
}