"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { signInWithEmailAndPassword, sendPasswordResetEmail, type AuthError } from "firebase/auth";
import { auth } from "@/lib/firebase";

const inputClasses =
  "h-12 w-full rounded-xl border border-white/25 bg-white/10 px-4 text-sm text-white placeholder-white/40 outline-none backdrop-blur-md transition-colors focus:border-white/60";

type Mode = "signin" | "reset-request";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/user-not-found": "Correo o contraseña incorrectos.",
  "auth/invalid-email": "Ingresá un correo electrónico válido.",
  "auth/too-many-requests": "Demasiados intentos. Probá de nuevo en unos minutos.",
};

function authErrorMessage(error: unknown): string {
  const code = (error as AuthError)?.code;
  return (code && AUTH_ERROR_MESSAGES[code]) || "Ocurrió un error. Intentá de nuevo.";
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setGlobalError("");
    setSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error("session-failed");

      // Full navigation so proxy.ts re-checks the freshly-set session cookie.
      const redirectTo = new URLSearchParams(window.location.search).get("redirect_url");
      window.location.assign(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard");
    } catch (error) {
      setSubmitting(false);
      setGlobalError(
        error instanceof Error && error.message === "session-failed"
          ? "No se pudo completar el inicio de sesión. Intentá de nuevo."
          : authErrorMessage(error)
      );
    }
  }

  async function handleRequestReset(e: FormEvent) {
    e.preventDefault();
    setGlobalError("");
    setSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setInfo(`Te enviamos un enlace para restablecer tu contraseña a ${email}.`);
    } catch (error) {
      setGlobalError(authErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1493238792000-8113da705763"
        alt="Un auto deportivo en una calle de la ciudad al atardecer"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Mobile: single uniform dark layer so the form stays legible everywhere. */}
      <div className="absolute inset-0 bg-black/50 lg:hidden" />

      {/* Desktop: left half stays clear, right half (where the form sits) goes to 50% dark. */}
      <div className="absolute inset-0 hidden lg:grid lg:grid-cols-2">
        <div />
        <div className="bg-black/50" />
      </div>

      <div className="relative z-10 grid w-full grid-cols-1 lg:grid-cols-2">
        <div className="hidden flex-col items-start justify-end p-12 text-left lg:flex">
          <span className="mb-auto text-xl font-semibold tracking-tight text-white drop-shadow-sm">
            OXIS <span className="text-[#5eb1ff]">AUTO</span>
          </span>
          <div className="max-w-md space-y-3">
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white drop-shadow-md">
              Panel de gestión del concesionario.
            </h1>
            <p className="text-sm leading-relaxed text-white/80 drop-shadow-sm">
              Gestioná el inventario, seguí las consultas de clientes en un pipeline claro y
              supervisá la operación diaria del showroom.
            </p>
          </div>
          <p className="mt-6 text-xs text-white/50">&copy; {new Date().getFullYear()} OXIS Auto.</p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 text-center">
              <span className="text-lg font-semibold tracking-tight text-white drop-shadow-sm lg:hidden">
                OXIS <span className="text-[#5eb1ff]">AUTO</span>
              </span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white drop-shadow-sm">
                {mode === "signin" && "Bienvenido de nuevo"}
                {mode === "reset-request" && "Restablecer contraseña"}
              </h2>
              <p className="mt-1 text-xs text-white/60">
                {mode === "signin" && "Ingresá tus credenciales para acceder al panel"}
                {mode === "reset-request" && (info || "Te enviaremos un enlace a tu correo")}
              </p>
            </div>

            {mode === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/70">
                    Correo electrónico
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className={inputClasses}
                  />
                </label>

                <label className="block">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-white/70">Contraseña</span>
                    <button
                      type="button"
                      onClick={() => {
                        setGlobalError("");
                        setInfo("");
                        setMode("reset-request");
                      }}
                      className="text-xs font-medium text-[#5eb1ff] hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className={inputClasses}
                  />
                </label>

                {globalError && <p className="text-xs text-red-300">{globalError}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 h-12 w-full rounded-xl bg-white font-medium text-[#1D1D1F] transition-all active:scale-[0.98] hover:bg-white/90 disabled:opacity-50"
                >
                  {submitting ? "Ingresando…" : "Ingresar"}
                </button>
              </form>
            )}

            {mode === "reset-request" && (
              <form onSubmit={handleRequestReset} className="space-y-4" noValidate>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/70">
                    Correo electrónico
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    disabled={Boolean(info)}
                    className={inputClasses}
                  />
                </label>

                {globalError && <p className="text-xs text-red-300">{globalError}</p>}

                {!info && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 h-12 w-full rounded-xl bg-white font-medium text-[#1D1D1F] transition-all active:scale-[0.98] hover:bg-white/90 disabled:opacity-50"
                  >
                    {submitting ? "Enviando…" : "Enviar enlace"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setInfo("");
                    setGlobalError("");
                    setMode("signin");
                  }}
                  className="w-full text-center text-xs font-medium text-white/70 hover:text-white"
                >
                  &larr; Volver a iniciar sesión
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-[11px] text-white/40">
              Protegido con la infraestructura de Google Cloud
            </p>
          </div>

          <Link
            href="/"
            className="mt-8 text-xs font-medium text-white/70 drop-shadow-sm transition-colors hover:text-white"
          >
            &larr; Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}
