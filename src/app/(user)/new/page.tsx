'use client'

import { FormEvent, ReactNode, useState } from 'react'
import { Link } from '@/components/link'
import { Input } from '@/components/input'
import { Textarea } from '@/components/textarea'
import { Button } from '@/components/button'
import { isEmpty, isLength } from 'validator'
import { Alert } from '@/components/alert'
import axios, {AxiosError, AxiosResponse} from 'axios'
import cookie from 'js-cookie'
import {errorResponse} from "@/app/interfaces";

export default function Page(): ReactNode {
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ inputError, setInputError ] = useState({ input: '', message: '' })
    const [ dangerAlert, setDangerAlert ] = useState<string>()

    const onClickSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault()

        const form = e.target as HTMLFormElement
        const subject: string = (form.elements.namedItem('subject') as HTMLInputElement).value
        const message: string = (form.elements.namedItem('message') as HTMLInputElement).value

        if (isEmpty(subject)) return setInputError ({ input: 'subject', message: 'Subject must be a string' })
        if (!isLength(subject, { min: 5, max: 100 })) return setInputError({ input: 'subject', message: 'Subject must be between 5 and 100 characters long' })

        if (isEmpty(message))  return setInputError ({ input: 'message', message: 'Message must be a string' })
        if (!isLength(message, { min: 1, max: 500 })) return setInputError({ input: 'message', message: 'Message must be between 1 and 500 characters long' })

        setIsLoading (true)

        axios.post(`http://localhost:8080/ticket/new`, { subject, message }, {
            headers: { 'Authorization': `Bearer ${cookie.get('session')}` }
        }).then((data: AxiosResponse): string => window.location.href = `/ticket/${data.data.ticketId}`)
        .catch((error: AxiosError<errorResponse>): void => {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.error?.message) setInputError({ input: 'subject', message: error.response.data.error.message })
                else setDangerAlert('No response from server. Please check your connection')
            } else setDangerAlert('An unexpected error occurred')
        })

        setIsLoading (false)
        form.reset()
    }

    return (
        <>
            <div className='flex flex-row items-center justify-between mb-8'>
                <h1 className='text-palette-primary text-3xl font-semibold'>New ticket</h1>
                <Link href={'/'} variant={'primary'}>Back to home</Link>
            </div>
            {dangerAlert ? <Alert title='Oops!' message={dangerAlert} severity={'danger'} variant={'primary'} style={'filled'} /> : null}
            <form onSubmit={(e: FormEvent<HTMLFormElement>) => onClickSubmit(e)}>
                <div className='flex flex-col space-y-3 mt-5'>
                    <Input id='subject' label='Subject' severity={inputError.input === 'subject' ? 'danger' : 'primary'} desc={inputError.input === 'subject' ? inputError.message : ''} />
                    <Textarea id='message' label='Message' severity={inputError.input === 'message' ? 'danger' : 'primary'} desc={inputError.input === 'message' ? inputError.message : ''} />
                </div>
                <div className='flex flex-col space-y-3 mt-7'>
                    <Button loading={isLoading}>Submit</Button>
                </div>
            </form>
        </>
    )
}