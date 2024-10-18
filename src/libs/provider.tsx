'use client'

import { createContext, useState, useEffect, ReactNode } from 'react'
import { Transition } from '@headlessui/react'
import logotype from '@/images/favicon.png'
import Image from 'next/image'
import axios from 'axios'

interface UserDataInterface {
    loading: boolean
    authenticated: boolean
    user: {
        id?: number
        email?: string
        role?: string
    }
}

const ContextData = createContext<{
    data: UserDataInterface
    updateData: (key: string, value: string | number | boolean) => void
}>({
    data: {
        loading: true,
        authenticated: false,
        user: {
            id: undefined,
            email: undefined,
            role: undefined
        }
    },
    updateData: () => {}
})

function ProviderContext ({ children }: { children: ReactNode }): JSX.Element {
    const [data, setData] = useState<UserDataInterface>({
        loading: true,
        authenticated: false,
        user: {}
    })

    const updateData = (key: string, value: string | number | boolean) => {
        setData((prevData) => ({
            ...prevData,
            [key]: value
        }))
    }

    useEffect(() => {
        if (sessionStorage.getItem('session')) {
            axios.get('http://localhost:8080/user/me', {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('session')}`
                }
            }).then((response) => {
                if (response.status === 200) {
                    updateData('user', response.data)
                    updateData('authenticated', true)
                    updateData('loading', false)
                } else {
                    sessionStorage.removeItem('session')
                    updateData('loading', false)
                }
            }).catch(() => {
                sessionStorage.removeItem('session')
                updateData('loading', false)
            })
        } else {
            updateData('loading', false)
        }
    }, [])

    return (
        <>
            <ContextData.Provider value={{ data, updateData }}>{!data.loading && children}</ContextData.Provider>
        </>
    )
}

export { ContextData, ProviderContext }