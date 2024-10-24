import { ReactNode } from 'react'
import { Button } from '@/components/button'
import { ControlProps } from './page'
import moment from 'moment/moment'
import axios, { AxiosError } from 'axios'
import { errorResponse } from '@/app/interfaces'
import cookie from 'js-cookie'

export function Control ({ data, ticket, updateTicket, setDangerAlert }: ControlProps): ReactNode {
    const assignedButton = (): void => {
        axios.put(`http://localhost:8080/ticket/${ticket.ticket_id}/assigned/?admin`, null, {
            headers: { 'Authorization': `Bearer ${cookie.get('session')}` }
        }).then((): void => updateTicket()).catch((error: AxiosError<errorResponse>): void => {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.error?.message) setDangerAlert(error.response.data.error.message)
                else setDangerAlert('No response from server. Please check your connection')
            } else setDangerAlert('An unexpected error occurred')
        })
    }
    const closeButton = (): void => {
        axios.put(`http://localhost:8080/ticket/${ticket.ticket_id}/close/?admin`, null, {
            headers: { 'Authorization': `Bearer ${cookie.get('session')}` }
        }).then((): void => updateTicket()).catch((error: AxiosError<errorResponse>): void => {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.error?.message) setDangerAlert(error.response.data.error.message)
                else setDangerAlert('No response from server. Please check your connection')
            } else setDangerAlert('An unexpected error occurred')
        })
    }
    return (
        <div className='flex flex-col h-full overflow-y-hidden min-w-[20%] max-w-[20%]'>
            <div className='flex flex-row items-center space-x-2 border-b border-palette-background-secondary p-5'>
                <span className='text-2xl font-semibold'>Basic information</span>
            </div>
            <div className='flex flex-col justify-between h-full p-5'>
                <div>
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
                        <span className='text-palette-gray-1'>{ticket.assigned_id ? (ticket.assigned_name ? ticket.assigned_name : `Support agent ${ticket.assigned_id}`) : 'Not assigned'}</span>
                    </div>
                </div>
                {ticket.status !== 3 && <div className='space-y-3'>
                    {!ticket.assigned_id && <Button variant='success' className='w-full' onClick={assignedButton}>Take a ticket</Button>}
                    {ticket.assigned_id === data.user.id && <Button variant='warning' className='w-full' onClick={assignedButton}>Quit a ticket</Button>}
                    {ticket.assigned_id === data.user.id && <Button variant='danger' className='w-full' onClick={closeButton}>Close the ticket</Button>}
                </div>}
            </div>
        </div>
    )
}