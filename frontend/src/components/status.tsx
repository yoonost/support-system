import { ReactNode } from 'react'

export const Status = ({ status }: { status: number }): ReactNode => {
    if (status === 1) {
        return (<div className='rounded-full text-xs bg-palette-success-primary px-1.5'>Open</div>)
    } else if (status === 2) {
        return (<div className='rounded-full text-xs bg-palette-default-primary px-1.5'>In progress</div>)
    } else if (status === 3) {
        return (<div className='rounded-full text-xs bg-palette-danger-primary px-1.5'>Closed</div>)
    } else {
        return null
    }
}