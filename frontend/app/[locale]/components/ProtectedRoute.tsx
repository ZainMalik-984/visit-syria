'use client'

import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { RootState } from '@/_lib/store/store'

export default function ProtectedRoute({
    children,
    requireAuth = true,
    allowedRoles = [],
}: {
    children: React.ReactNode
    requireAuth?: boolean
    allowedRoles?: string[]
}) {
    const { isAuthenticated, role, isInitialized } = useSelector(
        (state: RootState) => state.auth
    )
    const router = useRouter()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        if (!isInitialized) return

        // ----- auth check -----
        if (requireAuth && !isAuthenticated) {
            console.log('ProtectedRoute: Not authenticated, redirecting to login')
            router.replace('/login')
            setAuthorized(false)
            return
        }

        // ----- role check -----
        if (allowedRoles.length && !allowedRoles.includes(role || '')) {
            router.replace('/') // or '/'
            setAuthorized(false)
            return
        }

        // passed all gates
        setAuthorized(true)
    }, [isAuthenticated, role, requireAuth, allowedRoles, router, isInitialized])

    // show nothing (or a spinner) while deciding or redirecting
    if (!authorized) return null

    return <>{children}</>
}
