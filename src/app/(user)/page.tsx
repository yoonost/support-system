'use client'

import { useEffect, useState, ReactNode } from 'react'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { Link } from '@/components/link'
import { Status } from '@/components/status'
import NextLink from 'next/link'

export default function Page(): ReactNode {
    const [ tickets, setTickets ] = useState([])

    useEffect(() => {
        axios.get(`http://localhost:8080/ticket/tickets`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('session')}`
            }
        }).then((data: AxiosResponse) => {
            if (data.data.status) setTickets(data.data.data)
        })
    }, [])

    return (
        <>
            <div className='flex flex-row items-center justify-between mb-8'>
                <h1 className='text-palette-primary text-3xl font-semibold'>Tickets</h1>
                <Link href={'/new-ticket'} variant={'primary'}>New ticket</Link>
            </div>
            <div className='flex flex-col space-y-3'>
                {tickets.map((data, i: number): ReactNode => (
                    <NextLink key={i} href={`/chat/${data.ticket_id}`} className='flex flex-col bg-palette-background-secondary hover:bg-palette-gray-5 p-3 rounded-lg cursor-pointer transition'>
                        <div className='flex flex-row justify-between items-center mb-1'>
                            <span className='font-semibold text-sm'>{data.subject}</span>
                            <div className='flex flex-row space-x-1'>
                                <Status status={data.status} />
                            </div>
                        </div>
                        <span className='h-8 truncate-text text-xs text-palette-gray-2'>{data.last_message}</span>
                    </NextLink>
                ))}
            </div>
        </>
    )
}