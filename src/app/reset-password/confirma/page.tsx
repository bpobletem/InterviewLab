"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ConfirmaPage() {
    const supabase = createClient();
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [tokenReady, setTokenReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const hash = window.location.hash;
        const accessToken = new URLSearchParams(hash.substring(1)).get("access_token");

        if (accessToken) {
            supabase.auth
                .setSession({ access_token: accessToken, refresh_token: "" })
                .then(() => {
                    setTokenReady(true);
                })
                .catch((error) => {
                    console.error("Error al establecer sesión:", error.message);
                    setMessage("El enlace no es válido o expiró.");
                });
        } else {
            setMessage("No se encontró token de recuperación.");
        }
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setMessage("Error al actualizar la contraseña.");
        } else {
            setMessage("Contraseña actualizada con éxito. Redirigiendo al login...");
            setTimeout(() => router.push("/login"), 2000);
        }

        setLoading(false);
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-md shadow">
                <h1 className="text-2xl font-bold text-center mb-4">Nueva contraseña</h1>
                <p className="text-sm text-center mb-4">Ingresa tu nueva contraseña para continuar</p>

                {!tokenReady && <p className="text-center text-sm text-red-600">{message}</p>}

                {tokenReady && (
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Nueva contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded text-sm"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-2 rounded text-sm font-semibold hover:bg-black"
                        >
                            {loading ? "Actualizando..." : "Actualizar contraseña"}
                        </button>
                        {message && (
                            <p className="mt-4 text-sm text-center text-gray-600">{message}</p>
                        )}
                    </form>
                )}
            </div>
        </main>
    );
}
