'use client'

import { createContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface userDataInterface {
    loading: boolean
    authenticated: boolean
    user: {
        id?: number
        email?: string
        role?: string
    }
}

const ContextData = createContext({
    data: {
        loading: true,
        authenticated: false,
        user: {}
    }
})

function ProviderContext ({ children }: { children: ReactNode }): ReactNode {
    const [ userData, setData ] = useState<userDataInterface>({
        loading: true,
        authenticated: false,
        user: {}
    })

    const updateData = (key: string, value: string | number | boolean) =>
        setData({ ...userData, [key]: value })

    useEffect(() => {
        updateData('loading', false)
    })

    return (
        <ContextData.Provider value={{ userData, updateData }}>{!userData.loading ? children : 'loading'}</ContextData.Provider>
    )
}

export { ContextData, ProviderContext }