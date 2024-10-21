'use client'

import { useState, useEffect, useContext, ReactNode, Dispatch, SetStateAction } from 'react'
import {errorResponse, ticketProps, userDataInterface} from '@/app/interfaces'
import { useParams } from 'next/navigation'
import { Chat } from './chat'
import { Control } from './control'
import { Loading } from '@/components/loading'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { ContextData } from '@/libs/provider'
import cookie from 'js-cookie'

export interface ControlProps {
    data: userDataInterface,
    ticket: ticketProps
    updateTicket: () => void
    dangerAlert?: string
    setDangerAlert: Dispatch<SetStateAction<string | undefined>>
}

export default function Page(): ReactNode {
    const { data } = useContext(ContextData)
    const [ dangerAlert, setDangerAlert ] = useState<string>()
    const [ ticket, setTicket ] = useState<ticketProps>()
    const { id } = useParams()

    const updateTicket = (): void => {
        axios.get(`http://localhost:8080/ticket/${id}/?admin`, {
            headers: { 'Authorization': `Bearer ${cookie.get('session')}` }
        }).then((data: AxiosResponse): void => setTicket(data.data.data)).catch((error: AxiosError<errorResponse>): void => {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.error?.message) setDangerAlert(error.response.data.error.message)
                else setDangerAlert('No response from server. Please check your connection')
            } else setDangerAlert('An unexpected error occurred')
        })
    }

    useEffect(() => {
        updateTicket()
        const interval = setInterval(() => updateTicket(), 3000)
        return () => clearInterval(interval)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return ticket ? (
        <>
            <Chat data={data} ticket={ticket} updateTicket={updateTicket} dangerAlert={dangerAlert} setDangerAlert={setDangerAlert} />
            <Control data={data} ticket={ticket} updateTicket={updateTicket} dangerAlert={dangerAlert} setDangerAlert={setDangerAlert} />
        </>
    ) : <Loading />
}