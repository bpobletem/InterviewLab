'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <nav className="w-full border-b border-gray-200 px-6 py-3 flex justify-between items-center bg-white text-sm">
            <Link href="/home" className="font-semibold text-gray-800">InterviewLab</Link>
            <div className="flex items-center gap-4">
                <Link href="/home" className="text-gray-600 hover:text-black transition">Inicio</Link>
                <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-black transition"
                >
                    Cerrar sesión
                </button>
            </div>
        </nav>
    )
}
