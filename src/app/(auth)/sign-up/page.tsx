'use client'

import { FormEvent, ReactNode, useState } from 'react'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import Link from 'next/link'
import { isEmail, isEmpty, isLength, matches } from 'validator'
import axios from 'axios'

export default function Page(): ReactNode {
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ inputError, setInputError ] = useState({ input: '', message: '' })

    const onClickSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault()

        const form = e.target as HTMLFormElement
        const email: string = (form.elements.namedItem('email') as HTMLInputElement).value
        const password: string = (form.elements.namedItem('password') as HTMLInputElement).value
        const repassword: string = (form.elements.namedItem('repassword') as HTMLInputElement).value

        if (!isEmail(email))
            return setInputError({ input: 'email', message: 'Invalid email format' })
        if (!isLength(email, { min: 5, max: 64 }))
            return setInputError({ input: 'email', message: 'Email must be between 5 and 64 characters' })

        if (isEmpty(password))
            return setInputError({ input: 'password', message: 'Password must be a string' })
        if (!isLength(password, { min: 8, max: 32 }))
            return setInputError({ input: 'password', message: 'Password must be between 8 and 32 characters' })
        if (!matches(password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/))
            return setInputError({ input: 'password', message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' })

        if (isEmpty(repassword))
            return setInputError({ input: 'repassword', message: 'The field must not be empty' })
        if (password !== repassword)
            return setInputError({ input: 'repassword', message: 'Passwords do not match' })

        setIsLoading (true)

        try {
            const { data } = await axios.post(`http://localhost:8080/authorize/sign-up`, { email, password })
            if (data.error?.message) {
                setInputError({ input: 'email', message: data.error.message })
            } else {
                sessionStorage.setItem('session', data.data.sessionToken)
                window.location.href = '/'
            }
        } catch (error) {
            if (error?.response?.data?.error?.message) setInputError({ input: 'email', message: error?.response?.data?.error?.message })
            else setInputError({ input: 'email', message: 'No response from server. Please check your connection.' })
        }

        setIsLoading (false)
    }

    return (
        <>
            <h1 className='font-semibold text-2xl'>Sign up</h1>
            <form onSubmit={(e: FormEvent<HTMLFormElement>) => onClickSubmit(e)}>
                <div className='flex flex-col space-y-3 mt-5'>
                    <Input id='email' label='Email' severity={inputError.input === 'email' ? 'danger' : 'primary'} desc={inputError.input === 'email' ? inputError.message : ''} />
                    <Input id='password' label='Password' type='password' severity={inputError.input === 'password' ? 'danger' : 'primary'} desc={inputError.input === 'password' ? inputError.message : ''} />
                    <Input id='repassword' label='Repeat password' type='password' severity={inputError.input === 'repassword' ? 'danger' : 'primary'} desc={inputError.input === 'repassword' ? inputError.message : ''} />
                </div>
                <div className='flex flex-col space-y-3 mt-7'>
                    <Button loading={isLoading}>Sign up</Button>
                    <div className='flex flex-row space-x-1'>
                        <span className='text-sm'>You have an account?</span>
                        <Link href={'/sign-in'} className={'text-palette-default-primary font-semibold text-sm'}>Sign in</Link>
                    </div>
                </div>
            </form>
        </>
    )
}
