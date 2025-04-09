'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
    const [userName, setUserName] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const { data, error } = await supabase.auth.getUser()

            if (error || !data.user) {
                router.push('/login') // Si no hay usuario, lo manda al login
                return
            }

            // Puedes personalizar esto si tu usuario tiene un campo personalizado como `name`
            const name = data.user.user_metadata?.name || data.user.email
            setUserName(name)
        }

        getUser()
    }, [router])

    return (
        <main className="flex items-center justify-center min-h-screen bg-white text-gray-800">
            <h1 className="text-2xl font-semibold">Hola, {userName ?? 'cargando...'}</h1>
        </main>
    )
}
