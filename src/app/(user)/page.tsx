'use client'

import { useEffect, useState, ReactNode, useContext } from 'react'
import axios, { AxiosResponse, AxiosError } from 'axios'
import { TbZoomExclamation } from 'react-icons/tb'
import { Link } from '@/components/link'
import { Status } from '@/components/status'
import { Alert } from '@/components/alert'
import { ContextData } from '@/libs/provider'
import NextLink from 'next/link'
import cookie from 'js-cookie'

interface ticketProps {
    ticket_id: number
    subject: string
    status: number
    created_at: number
    updated_at: number
    creator: string
    creator_name: string | null
    source: number
    assigned_id: number
    assigned_name: string | null
    last_message: string | null
}

interface ErrorResponse {
    error: {
        message?: string
    }
}

export default function Page(): ReactNode {
    const { data } = useContext(ContextData)
    const [ tickets, setTickets ] = useState<ticketProps[]>([])
    const [ dangerAlert, setDangerAlert ] = useState<string>()

    const updateTickets = (): void => {
        axios.get(`http://localhost:8080/ticket/tickets`, {
            headers: { 'Authorization': `Bearer ${cookie.get('session')}` }
        }).then((data: AxiosResponse): void => {
            if (data.data.status) setTickets(data.data.data)
            else setDangerAlert('Failed to fetch tickets. Server returned an error')
        }).catch((error: AxiosError<ErrorResponse>): void => {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.error?.message) setDangerAlert(error.response.data.error.message)
                else setDangerAlert('No response from server. Please check your connection')
            } else setDangerAlert('An unexpected error occurred')
        })
    }

    useEffect(() => {
        updateTickets()
        const interval = setInterval(() => updateTickets(), 10000)
        return () => clearInterval(interval)
    }, [])

    return (
        <>
            <div className='flex flex-row items-center justify-between space-x-4 mb-8'>
                <h1 className='text-palette-primary text-3xl font-semibold truncate'>Hello, {data.user.username}</h1>
                <div className={'flex-row space-x-3 whitespace-nowrap'}>
                    {data.user.role === 'admin' && <Link href={'/admin'} variant={'primary'}>Admin panel</Link>}
                    <Link href={'/new'} variant={'primary'}>New ticket</Link>
                </div>
            </div>
            {dangerAlert ? <Alert title='Oops!' message={dangerAlert} severity={'danger'} variant={'primary'} style={'filled'} /> : null}
            <div className='flex flex-col space-y-3'>
                {tickets.map((data: ticketProps, i: number): ReactNode => (
                    <NextLink key={i} href={`/ticket/${data.ticket_id}`} className='flex flex-col bg-palette-background-secondary hover:bg-palette-gray-5 p-3 rounded-lg cursor-pointer transition'>
                        <div className='flex flex-row justify-between items-center mb-1'>
                            <span className='font-semibold text-sm truncate max-w-[90%]'>{data.subject}</span>
                            <div className='flex flex-row space-x-1'>
                                <Status status={data.status} />
                            </div>
                        </div>
                        <span className='truncate-text text-xs text-palette-gray-2'>{data.last_message}</span>
                    </NextLink>
                ))}
                {tickets.length === 0 && (
                    <div className='flex items-center bg-palette-background-secondary space-x-1 px-3 py-4 rounded-lg text-palette-gray-2'>
                        <TbZoomExclamation className='w-6 h-auto' />
                        <span>You have not created any tickets yet</span>
                    </div>
                )}
            </div>
        </>
    )
}