'use client'

import { useEffect, ReactNode, useState } from 'react'
import { useParams } from 'next/navigation'
import { Link } from '@/components/link'
import { cn } from '@/libs/utils'
import { Button } from '@/components/button'
import { Textarea } from '@/components/textarea'
import axios, { AxiosResponse } from 'axios'
import moment from 'moment'

export default function Page(): ReactNode {
    const [ ticket, setTicket ] = useState<any>(null)
    const { id } = useParams()

    useEffect(() => {
        axios.get(`http://localhost:8080/ticket/${id}`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('session')}` }
        }).then((data: AxiosResponse) => {
            setTicket(data.data.data)
        }).catch(() => {
            window.location.href = '/'
        })
    }, [])

    return ticket && (
        <>
            <div className='flex flex-row items-center justify-between mb-8'>
                <div className='flex flex-row items-center space-x-2'>
                    <span className='text-3xl font-semibold'>{ticket.subject}</span>
                    <span className='text-xl text-palette-gray-2'>(# {ticket.ticket_id})</span>
                </div>
                <Link href={'/'} variant={'primary'}>Back to home</Link>
            </div>
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
                        <span className='text-palette-gray-1'>{ticket.source === 1 ? 'Personal cabinet' : ticket.source === 2 ? 'Web Mail' : 'Telegram'}</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className='text-palette-gray-2'>Status</span>
                        <span className='text-palette-gray-1'>{ticket.status === 1 ? 'Open' : ticket.status === 2 ? 'In progress' : 'Closed'}</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className='text-palette-gray-2'>Assigned</span>
                        <span className='text-palette-gray-1'>{ticket.assigned_id ? `Support agent #${ticket.assigned_id}` : 'Awaiting'}</span>
                    </div>
                </div>
                <div className={cn('p-4', ticket.status === 3 && 'hidden')}>
                    <form className='flex flex-col space-y-3 py-5'>
                        <Textarea divClassname='w-full' inputClassName='w-full' size='small' placeholder='Enter a message...'/>
                        <div className={'flex justify-end space-x-3'}>
                            <Button variant='danger'>Close the ticket</Button>
                            <Button>Send</Button>
                        </div>
                    </form>
                </div>
            </div>
            <div className='flex flex-col space-y-3 overflow-y-scroll scroll-sidebar p-5 h-full'>
                {ticket.messages.map((message: any, i: number): ReactNode => {
                    const type = true


                    if (message.type === 1) return (
                        <div className='flex items-end justify-end'>
                            user
                        </div>
                    )

                    if (message.type === 2) return (
                        <div className='flex items-end justify-start'>
                            admin
                        </div>
                    )

                    if (message.type === 3) return (
                        <div className='flex items-end justify-center'>
                            system
                        </div>
                    )

                    return (
                        <div className={cn('flex items-end', message.type === 1 ? 'justify-end' : message.type === 2 ? 'justify-start' : 'justify-center')} key={i}>
                            <div className={cn('flex flex-col max-w-[50%]', message.type === 1 ? 'items-end' : message.type === 2 ? 'items-start' : 'items-center')}>
                                <div className={cn('flex flex-row items-center gap-x-1 mb-1 flex-wrap', message.type === 1 && 'flex-row-reverse')}>
                                    <span className='text-palette-gray-1'>{message.type === 1 ? 'You' : `Support agent #${message.sender}`}</span>
                                    <span className='text-palette-gray-3 text-xs'>{moment(message.sent_at * 1000).endOf('seconds').fromNow()}</span>
                                </div>
                                <div className={cn('bg-palette-gray-5 px-3 py-2 rounded-lg', type && 'bg-palette-default-primary')}>
                                    <span className='text-sm text-palette-gray-1'>{message.message}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}