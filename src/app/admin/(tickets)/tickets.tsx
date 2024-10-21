'use client'

import { useState, useEffect, ReactNode } from 'react'
import { TbZoomExclamation } from 'react-icons/tb'
import { Input } from '@/components/input'
import { FaArrowLeft } from 'react-icons/fa6'
import { ticketsProps } from '@/app/interfaces'
import { Status } from '@/components/status'
import axios, { AxiosResponse } from 'axios'
import cookie from 'js-cookie'
import Link from 'next/link'

export function Tickets (): ReactNode {
    const [ tickets, setTickets] = useState<ticketsProps[]>([])
    const [ filteredTickets, setFilteredTickets ] = useState<ticketsProps[]>([])
    const [ searchTerm, setSearchTerm ] = useState<string>('')

    const updateTickets = (): void => {
        axios.get(`http://localhost:8080/ticket/tickets?admin`, {
            headers: { 'Authorization': `Bearer ${cookie.get('session')}` }
        }).then((data: AxiosResponse): void => {
            if (data.data.status) {
                setTickets(data.data.data)
                setFilteredTickets(data.data.data)
            }
        })
    }

    useEffect(() => {
        updateTickets()
        const interval = setInterval(() => updateTickets(), 3000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const filtered = tickets.filter((ticket) =>
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ticket.last_message?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        )
        setFilteredTickets(filtered)
    }, [searchTerm, tickets])

    return (
        <div className='flex flex-col h-full border-r border-palette-background-secondary overflow-y-hidden p-5 min-w-[20%] max-w-[20%]'>
            <div className='flex flex-row space-x-3 items-center mb-5'>
                <Link href={'/'} className='p-2.5 bg-palette-gray-5 rounded-full'><FaArrowLeft /></Link>
                <Input divClassname='w-full' inputClassName='rounded-full' size='small' placeholder='Search...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className='flex flex-col space-y-3 overflow-y-scroll h-full scroll-sidebar'>
                {filteredTickets.map((data: ticketsProps, i: number): ReactNode => (
                    <Link key={i} href={`/admin/ticket/${data.ticket_id}`} className='flex flex-col bg-palette-background-secondary hover:bg-palette-gray-5 p-3 rounded-lg cursor-pointer transition'>
                        <div className='flex flex-row justify-between items-center mb-1'>
                            <span className='font-semibold text-sm truncate max-w-[70%]'>{data.subject}</span>
                            <div className='flex flex-row space-x-1'>
                                <Status status={data.status} />
                            </div>
                        </div>
                        <span className='truncate-text text-xs text-palette-gray-2'>{data.last_message}</span>
                    </Link>
                ))}
                {filteredTickets.length === 0 && (
                    <div className='flex flex-col items-center text-palette-gray-2 justify-center h-screen'>
                        <TbZoomExclamation className='w-6 h-auto mb-2' />
                        <span>There are no tickets in the system</span>
                    </div>
                )}
            </div>
        </div>
    )
}