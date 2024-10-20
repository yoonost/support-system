'use client'

import { FormEvent, ReactNode, useState } from 'react'
import { Link } from '@/components/link'
import { Input } from '@/components/input'
import { Textarea } from '@/components/textarea'
import { Button } from '@/components/button'
import { isEmpty, isLength } from 'validator'
import axios from 'axios'

export default function Page(): ReactNode {
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ inputError, setInputError ] = useState({ input: '', message: '' })

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

        try {
            const { data } = await axios.post(`http://localhost:8080/ticket/new`, { subject, message }, {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('session')}` }
            })
            if (data.error?.message) {
                setInputError({ input: 'subject', message: data.error.message })
            } else window.location.href = `/chat/${data.data.ticketId}`
        } catch (error) {
            if (error?.response?.data?.error?.message) setInputError({ input: 'subject', message: error?.response?.data?.error?.message })
            else setInputError({ input: 'subject', message: 'No response from server. Please check your connection.' })
        }

        setIsLoading (false)
    }

    return (
        <>
            <div className='flex flex-row items-center justify-between mb-8'>
                <h1 className='text-palette-primary text-3xl font-semibold'>New ticket</h1>
                <Link href={'/'} variant={'primary'}>Back to home</Link>
            </div>
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