'use client'

import { FormEvent, ReactNode, useState } from 'react'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { isEmail, isEmpty, isLength, matches } from 'validator'
import Link from 'next/link'
import axios from 'axios'

export default function Page(): ReactNode {
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ inputError, setInputError ] = useState({ input: '', message: '' })

    const onClickSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault()

        const form = e.target as HTMLFormElement
        const username: string = (form.elements.namedItem('username') as HTMLInputElement).value
        const email: string = (form.elements.namedItem('email') as HTMLInputElement).value
        const password: string = (form.elements.namedItem('password') as HTMLInputElement).value
        const rePassword: string = (form.elements.namedItem('rePassword') as HTMLInputElement).value

        if (isEmpty(username)) return setInputError({ input: 'username', message: 'Username must be a string' })
        if (!isLength(username, { min: 3, max: 64 })) return setInputError({ input: 'username', message: 'Username must be between 3 and 64 characters' })

        if (!isEmail(email)) return setInputError({ input: 'email', message: 'Invalid email format' })
        if (!isLength(email, { min: 3, max: 64 })) return setInputError({ input: 'email', message: 'Email must be between 3 and 64 characters' })

        if (isEmpty(password)) return setInputError({ input: 'password', message: 'Password must be a string' })
        if (!isLength(password, { min: 3, max: 32 })) return setInputError({ input: 'password', message: 'Password must be between 8 and 32 characters' })
        if (!matches(password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) return setInputError({ input: 'password', message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' })

        if (isEmpty(rePassword)) return setInputError({ input: 'rePassword', message: 'The field must not be empty' })
        if (password !== rePassword) return setInputError({ input: 'rePassword', message: 'Passwords do not match' })

        setIsLoading (true)

        try {
            const { data } = await axios.post(`http://localhost:8080/authorize/sign-up`, { username, email, password })
            if (data.error?.message) {
                setInputError({ input: 'username', message: data.error.message })
            } else {
                sessionStorage.setItem('session', data.data.sessionToken)
                window.location.href = '/'
            }
        } catch (error) {
            if (error?.response?.data?.error?.message) setInputError({ input: 'username', message: error?.response?.data?.error?.message })
            else setInputError({ input: 'username', message: 'No response from server. Please check your connection.' })
        }

        setIsLoading (false)
    }

    return (
        <>
            <h1 className='font-semibold text-2xl'>Sign up</h1>
            <form onSubmit={(e: FormEvent<HTMLFormElement>) => onClickSubmit(e)}>
                <div className='flex flex-col space-y-3 mt-5'>
                    <Input id='username' label='Username' severity={inputError.input === 'username' ? 'danger' : 'primary'} desc={inputError.input === 'username' ? inputError.message : ''} />
                    <Input id='email' label='Email' severity={inputError.input === 'email' ? 'danger' : 'primary'} desc={inputError.input === 'email' ? inputError.message : ''} />
                    <Input id='password' label='Password' type='password' severity={inputError.input === 'password' ? 'danger' : 'primary'} desc={inputError.input === 'password' ? inputError.message : ''} />
                    <Input id='rePassword' label='Repeat password' type='password' severity={inputError.input === 'rePassword' ? 'danger' : 'primary'} desc={inputError.input === 'rePassword' ? inputError.message : ''} />
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
