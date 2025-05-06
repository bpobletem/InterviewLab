"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ConfirmaPage() {
    const supabase = createClient();
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setMessage("Error al actualizar la contraseña.");
        } else {
            setMessage("Contraseña actualizada. Redirigiendo al login...");
            setTimeout(() => router.push("/login"), 2500);
        }

        setLoading(false);
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded shadow">
                <h1 className="text-2xl font-bold text-center mb-4">Nueva contraseña</h1>
                <p className="text-sm text-center mb-4">Ingresa tu nueva contraseña</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nueva contraseña"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded text-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-gray-900 text-white rounded hover:bg-black"
                    >
                        {loading ? "Actualizando..." : "Actualizar contraseña"}
                    </button>
                </form>

                {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
            </div>
        </main>
    );
}
