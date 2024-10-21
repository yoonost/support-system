import {useRef, useEffect, ReactNode, FormEvent, useState} from 'react'
import { ControlProps } from './page'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import {errorResponse, messageProps} from '@/app/interfaces'
import moment from 'moment/moment'
import {Alert} from "@/components/alert";
import {isEmpty, isLength} from "validator";
import axios, {AxiosError} from "axios";
import cookie from "js-cookie";

export function Chat ({ data, ticket, updateTicket, dangerAlert, setDangerAlert }: ControlProps): ReactNode {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [ isLoading, setIsLoading ] = useState<boolean>(false)

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, [])

    const onClickSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault()

        const form = e.target as HTMLFormElement
        const message: string = (form.elements.namedItem('message') as HTMLInputElement).value

        if (isEmpty(message)) return setDangerAlert('Message must be a string')
        if (!isLength(message, { min: 1, max: 500 })) return setDangerAlert('Message must be between 1 and 500 characters long')
        setIsLoading(true)

        axios.post(`http://localhost:8080/ticket/${ticket.ticket_id}/send/?admin`, { message }, {
            headers: { 'Authorization': `Bearer ${cookie.get('session')}` }
        }).then((): void => updateTicket()).catch((error: AxiosError<errorResponse>): void => {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.error?.message) setDangerAlert(error.response.data.error.message)
                else setDangerAlert('No response from server. Please check your connection')
            } else setDangerAlert('An unexpected error occurred')
        })

        setIsLoading(false)
        form.reset()
    }

    return (
        <div className='flex flex-col h-full border-r border-palette-background-secondary overflow-y-hidden w-full'>
            <div className='flex flex-row items-center space-x-2 border-b border-palette-background-secondary mb-5 p-5'>
                <span className='text-2xl font-semibold'>{ticket.subject}</span>
                <span className='text-xl text-palette-gray-2'>(# {ticket.ticket_id})</span>
            </div>
            {dangerAlert ? (
                <div className='px-5'>
                    <Alert title='Oops!' message={dangerAlert} severity={'danger'} variant={'primary'} style={'filled'} />
                </div>
            ) : null}
            <div className='flex flex-col space-y-3 overflow-y-scroll scroll-sidebar p-5 h-full' ref={scrollRef}>
                {ticket.messages.map((message: messageProps, i: number): ReactNode => {
                    const senderMap: { [key: number]: string } = { 1: message.sender_name || `#${message.sender}`, 2: message.sender_name || message.sender, 3: message.sender_name || `Telegram #${message.sender}` }
                    const sender: string = senderMap[message.source] || 'unknown'
                    const roleClasses: { [key: number]: string } = { 1: 'flex items-end justify-start', 2: 'flex items-end justify-end', 3: 'flex items-end justify-center' }
                    const contentClasses: { [key: number]: string } = { 1: 'bg-palette-gray-5', 2: 'bg-palette-default-primary', 3: 'text-sm text-palette-gray-3 py-2 text-center' }
                    return (
                        <div className={roleClasses[message.role]} key={i}>
                            <div className={`flex flex-col max-w-[50%] ${message.role === 3 ? 'items-center' : message.role === 1 ? 'items-start' : 'items-end'}`}>
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
                }).reverse()}
            </div>
            {ticket.status !== 3 && ticket.assigned_id === data.user.id && (
                <form className='flex flex-row flex-1 space-x-3 p-5' onSubmit={onClickSubmit}>
                    <Input id='message' divClassname='w-full' inputClassName='rounded-full w-full' size='small' placeholder='Enter a message...'/>
                    <Button className='rounded-full' loading={isLoading}>Send</Button>
                </form>
            )}
        </div>
    )
}