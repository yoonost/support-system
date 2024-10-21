'use client'

import { createContext, useState, useEffect, ReactNode } from 'react'
import { Loading } from '@/components/loading'
import { userDataInterface } from '@/app/interfaces'
import cookie from 'js-cookie'
import axios from 'axios'

const ContextData = createContext<{
    data: userDataInterface
    updateData: (key: string, value: string | number | boolean) => void
}>({
    data: {
        loading: true,
        authenticated: false,
        user: {
            id: undefined,
            username: undefined,
            email: undefined,
            role: undefined
        }
    },
    updateData: () => {}
})

function ProviderContext ({ children }: { children: ReactNode }): ReactNode {
    const [data, setData] = useState<userDataInterface>({
        loading: true,
        authenticated: false,
        user: {}
    })

    const updateData = (key: string, value: string | number | boolean): void => {
        setData((prevData) => ({
            ...prevData,
            [key]: value
        }))
    }

    useEffect(() => {
        if (cookie.get('session')) {
            axios.get('http://localhost:8080/user/me', {
                headers: { 'Authorization': `Bearer ${cookie.get('session')}` }
            }).then((response): void => {
                if (response.status === 200) {
                    updateData('user', response.data.data)
                    updateData('authenticated', true)
                    updateData('loading', false)
                } else {
                    if (response.status === 401) cookie.remove('session')
                    updateData('loading', false)
                }
            }).catch((): void => updateData('loading', false))
        } else updateData('loading', false)
    }, [])

    return (
        <>
            <ContextData.Provider value={{ data, updateData }}>{!data.loading ? children : <Loading />}</ContextData.Provider>
        </>
    )
}

export { ContextData, ProviderContext }