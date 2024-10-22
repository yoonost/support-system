import { ReactNode } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

export const Loading = (): ReactNode => {
    return (
        <div className='flex items-center justify-center mx-auto h-screen'>
            <AiOutlineLoading3Quarters className='animate-spin text-palette-gray-3 w-14 h-auto' />
        </div>
    )
}