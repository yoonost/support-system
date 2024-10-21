'use client'

import { useEffect, ReactNode, useState, FormEvent } from 'react'
import {ticketProps, messageProps, errorResponse} from '@/app/interfaces'
import { useParams } from 'next/navigation'
import { Link } from '@/components/link'
import { Button } from '@/components/button'
import { Textarea } from '@/components/textarea'
import axios, {AxiosError, AxiosResponse} from 'axios'
import { isLength, isEmpty } from 'validator'
import { Alert } from '@/components/alert'
import moment from 'moment'
import cookie from 'js-cookie'

export default function Page(): ReactNode {
    const [ isLoadingSend, setIsLoadingSend ] = useState<boolean>(false)
    const [ isLoadingClose, setIsLoadingClose ] = useState<boolean>(false)

    const [ dangerAlert, setDangerAlert ] = useState<string>()
    const [ inputError, setInputError ] = useState<string>()

    const [ ticket, setTicket ] = useState<ticketProps>()
    const { id } = useParams()

    const updateTicket = (): void => {
        axios.get(`http://localhost:8080/ticket/${id}`, {
            headers: { 'Authorization': `Bearer ${cookie.get('session')}` }
        }).then((data: AxiosResponse): void => setTicket(data.data.data)).catch((error: AxiosError<errorResponse>): void => {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.error?.message) setDangerAlert(error.response.data.error.message)
                else setDangerAlert('No response from server. Please check your connection')
            } else setDangerAlert('An unexpected error occurred')
        })
    }

    const onClickSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault()

        const form = e.target as HTMLFormElement
        const message: string = (form.elements.namedItem('message') as HTMLInputElement).value

        if (isEmpty(message)) return setInputError('Message must be a string')
        if (!isLength(message, { min: 1, max: 500 })) return setInputError('Message must be between 1 and 500 characters long')

        setIsLoadingSend(true)
        setInputError('')

        axios.post(`http://localhost:8080/ticket/${id}/send`, { message }, {
            headers: { 'Authorization': `Bearer ${cookie.get('session')}` }
        }).then((): void => {
            updateTicket()
            form.reset()
        }).catch((error: AxiosError<errorResponse>): void => {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.error?.message) setInputError(error.response.data.error.message)
                else setDangerAlert('No response from server. Please check your connection')
            } else setDangerAlert('An unexpected error occurred')
        })

        setIsLoadingSend(false)
    }

    const onClickClose = async (): Promise<void> => {
        setIsLoadingClose(true)

        axios.put(`http://localhost:8080/ticket/${id}/close`, null, {
            headers: { 'Authorization': `Bearer ${cookie.get('session')}` }
        }).then((): void => updateTicket()).catch((error: AxiosError<errorResponse>): void => {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.error?.message) setDangerAlert(error.response.data.error.message)
                else setDangerAlert('No response from server. Please check your connection')
            } else setDangerAlert('An unexpected error occurred')
        })

        setIsLoadingClose(false)
    }

    useEffect(() => {
        updateTicket()
        const interval = setInterval(() => updateTicket(), 10000)
        return () => clearInterval(interval)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return ticket && (
        <>
            <div className='flex flex-row items-center space-x-4 justify-between mb-8'>
                <div className='flex flex-row items-center space-x-2 truncate whitespace-nowrap'>
                    <span className='text-3xl font-semibold truncate'>{ticket.subject}</span>
                    <span className='text-xl text-palette-gray-2'>(# {ticket.ticket_id})</span>
                </div>
                <Link href={'/'} variant={'primary'}>Back to home</Link>
            </div>
            {dangerAlert ? <Alert title='Oops!' message={dangerAlert} severity={'danger'} variant={'primary'} style={'filled'} /> : null}
            <div className='bg-palette-background-secondary rounded-lg divide-palette-gray-5 divide-y'>
                <div className='p-4'>
                    <div className='flex justify-between'>
                        <span className='text-palette-gray-2'>Created</span>
                        <span className='text-palette-gray-1'>{moment(ticket.created_at * 1000).endOf('seconds').fromNow()}</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className='text-palette-gray-2'>Updated</span>
                        <span className='text-palette-gray-1'>{moment(ticket.updated_at * 1000).endOf('seconds').fromNow()}</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className='text-palette-gray-2'>Source</span>
                        <span className='text-palette-gray-1'>{ticket.source === 1 ? 'Personal cabinet' : (ticket.source === 2 ? 'Web Mail' : 'Telegram')}</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className='text-palette-gray-2'>Status</span>
                        <span className='text-palette-gray-1'>{ticket.status === 1 ? 'Open' : (ticket.status === 2 ? 'In progress' : 'Closed')}</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className='text-palette-gray-2'>Assigned</span>
                        <span className='text-palette-gray-1'>{ticket.assigned_id ? (ticket.assigned_name ? ticket.assigned_name : `Support agent ${ticket.assigned_id}`) : 'Awaiting'}</span>
                    </div>
                </div>
                {ticket.status !== 3 && (
                    <form className='flex flex-col space-y-3 py-5 px-4' onSubmit={onClickSubmit}>
                        <Textarea id='message' divClassname='w-full' inputClassName='w-full' size='small' placeholder='Enter a message...' severity={inputError ? 'danger' : 'primary'} desc={inputError} />
                        <div className={'flex justify-end space-x-3'}>
                            <Button variant='danger' type='button' onClick={onClickClose} loading={isLoadingClose}>Close the ticket</Button>
                            <Button type='submit' loading={isLoadingSend}>Send</Button>
                        </div>
                    </form>
                )}
            </div>
            <div className='flex flex-col space-y-3 overflow-y-scroll scroll-sidebar p-5 h-full'>
                {ticket.messages.map((message: messageProps, i: number): ReactNode => {
                    const senderMap: { [key: number]: string } = { 1: message.sender_name || `#${message.sender}`, 2: message.sender_name || message.sender, 3: message.sender_name || `Telegram #${message.sender}` }
                    const sender: string = senderMap[message.source] || 'unknown'
                    const roleClasses: { [key: number]: string } = { 1: 'flex items-end justify-end', 2: 'flex items-end justify-start', 3: 'flex items-end justify-center' }
                    const contentClasses: { [key: number]: string } = { 1: 'bg-palette-default-primary', 2: 'bg-palette-gray-5', 3: 'text-sm text-palette-gray-3 py-2 text-center' }
                    return (
                        <div className={roleClasses[message.role]} key={i}>
                            <div className={`flex flex-col max-w-[50%] ${message.role === 3 ? 'items-center' : message.role === 1 ? 'items-end' : 'items-start'}`}>
                                {message.role !== 3 && (
                                    <>
                                        <div className='flex flex-row items-center gap-x-1 mb-1 flex-wrap'>
                                            <span className='text-palette-gray-1'>{sender}</span>
                                            <span className='text-palette-gray-3 text-xs'>{moment(message.created_at * 1000).endOf('seconds').fromNow()}</span>
                                        </div>
                                        <div className={`${contentClasses[message.role]} px-3 py-2 rounded-lg`}>
                                            <span className='text-sm text-palette-gray-1 break-words break-all'>{message.message}</span>
                                        </div>
                                    </>
                                )}
                                {message.role === 3 && <span className={contentClasses[message.role]}>{message.message}</span>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}