'use client'

import { FormEvent, ReactNode, useState } from 'react'
import { Link } from '@/components/link'
import { Input } from '@/components/input'
import { Textarea } from '@/components/textarea'
import { Button } from '@/components/button'

export default function Page(): ReactNode {
    const [ isLoading, setIsLoading ] = useState<boolean>(false)

    const onClickSubmit = (e: FormEvent<HTMLFormElement>): void => {
        setIsLoading(true)
        e.preventDefault()
    }

    return (
        <>
            <div className='flex flex-row items-center justify-between mb-8'>
                <h1 className='text-palette-primary text-3xl font-semibold'>New ticket</h1>
                <Link href={'/'} variant={'primary'}>Back to home</Link>
            </div>
            <form onSubmit={(e) => onClickSubmit(e)}>
                <div className='flex flex-col space-y-3 mt-5'>
                    <Input id='subject' label='Subject'/>
                    <Textarea id='description' label='Description' />
                </div>
                <div className='flex flex-col space-y-3 mt-7'>
                    <Button loading={isLoading}>Submit</Button>
                </div>
            </form>
        </>
    )
}