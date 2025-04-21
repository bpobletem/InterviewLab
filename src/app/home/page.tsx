import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

    return (
        <main className="min-h-screen flex items-center justify-center bg-white text-gray-800 px-4">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold">Hola, {data.user.email}</h1>
                <p className="text-gray-600">Bienvenido a InterviewLab</p>
            </div>
        </main>
    )
}
