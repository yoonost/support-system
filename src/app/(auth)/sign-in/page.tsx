'use client'

import { FormEvent, ReactNode, useState } from 'react'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { isLength, isEmpty } from 'validator'
import cookie from 'js-cookie'
import Link from 'next/link'
import axios, {AxiosError, AxiosResponse} from 'axios'
import { errorResponse } from '@/app/interfaces'

export default function Page(): ReactNode {
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ inputError, setInputError ] = useState({ input: '', message: '' })

    const onClickSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault()

        const form = e.target as HTMLFormElement
        const identifier: string = (form.elements.namedItem('identifier') as HTMLInputElement).value
        const password: string = (form.elements.namedItem('password') as HTMLInputElement).value

        if (isEmpty(identifier)) return setInputError({ input: 'identifier', message: 'Username or email must be a string' })
        if (!isLength(identifier, { min: 3, max: 64 })) return setInputError({ input: 'identifier', message: 'Username or email must be between 3 and 64 characters' })

        if (isEmpty(password)) return setInputError({ input: 'password', message: 'Password must be a string' })
        if (!isLength(password, { min: 8, max: 32 })) return setInputError({ input: 'password', message: 'Password must be between 8 and 32 characters' })

        setIsLoading (true)
        setInputError ({ input: '', message: '' })

        axios.post(`http://localhost:8080/authorize/sign-in`, { identifier, password }, {
            headers: { 'Authorization': `Bearer ${cookie.get('session')}` }
        }).then((data: AxiosResponse): void => {
            cookie.set('session', data.data.data.sessionToken, { expires: 7 })
            window.location.href = '/'
        }).catch((error: AxiosError<errorResponse>): void => {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.error?.message) setInputError({ input: 'identifier', message: error.response.data.error.message })
                else setInputError({ input: 'identifier', message: 'No response from server. Please check your connection' })
            } else setInputError({ input: 'identifier', message: 'An unexpected error occurred' })
        })

        setIsLoading (false)
    }

    return (
        <>
            <h1 className='font-semibold text-2xl'>Sign in</h1>
            <form onSubmit={onClickSubmit}>
                <div className='flex flex-col space-y-3 mt-5'>
                    <Input id='identifier' label='Username or email' severity={inputError.input === 'identifier' ? 'danger' : 'primary'} desc={inputError.input === 'identifier' ? inputError.message : ''} />
                    <Input id='password' label='Password' type='password' severity={inputError.input === 'password' ? 'danger' : 'primary'} desc={inputError.input === 'password' ? inputError.message : ''} />
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
