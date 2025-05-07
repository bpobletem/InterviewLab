"use client";

import { useState } from "react";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        if (res.ok) {
            setMessage("Hemos enviado un enlace para restablecer tu contraseña.");
        } else {
            setMessage("Hubo un error. Por favor, intenta nuevamente.");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-md shadow">
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">Recuperar contraseña</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-black text-gray-900 rounded text-sm"
                    />
                    <button
                        type="submit"
                        className="w-full py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-black transition hover:cursor-pointer"
                    >
                        Enviar enlace de recuperación
                    </button>
                </form>
                {message && (
                    <p className="mt-4 text-sm text-center text-gray-900">{message}</p>
                )}
            </div>
        </main>
    );
}
