'use client'

import { FormEvent, ReactNode, useState } from 'react'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import Link from 'next/link'

export default function Page(): ReactNode {
    const [ isLoading, setIsLoading ] = useState<boolean>(false)

    const onClickSubmit = (e: FormEvent<HTMLFormElement>): void => {
        setIsLoading(true)
        e.preventDefault()
    }

    return (
        <>
            <h1 className='font-semibold text-2xl'>Sign in</h1>
            <form onSubmit={(e) => onClickSubmit(e)}>
                <div className='flex flex-col space-y-3 mt-5'>
                    <Input id='email' label='Email'/>
                    <Input id='password' label='Password' type='password'/>
                </div>
                <div className='flex flex-col space-y-3 mt-7'>
                    <Button loading={isLoading}>Sign in</Button>
                    <div className='flex flex-row space-x-1'>
                        <span className='text-sm'>Do not have an account?</span>
                        <Link href={'/sign-up'} className={'text-palette-default-primary font-semibold text-sm'}>Sign up</Link>
                    </div>
                </div>
            </form>
        </>
    )
}
