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
    messages: messageProps[]
}

interface ticketsProps {
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

interface messageProps {
    message: string
    role: number
    sender: string
    sender_name: string | null
    source: number
    created_at: number
}

interface userDataInterface {
    loading: boolean
    authenticated: boolean
    user: {
        id?: number
        username?: string
        email?: string
        role?: string
    }
}

interface errorResponse {
    error: {
        message?: string
    }
}

export type { userDataInterface, ticketProps, ticketsProps, messageProps, errorResponse }