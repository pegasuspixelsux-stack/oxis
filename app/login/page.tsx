"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";

const inputClasses =
  "h-12 w-full rounded-xl border border-white/25 bg-white/10 px-4 text-sm text-white placeholder-white/40 outline-none backdrop-blur-md transition-colors focus:border-white/60";

type Mode = "signin" | "reset-request" | "reset-verify";

export default function LoginPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [info, setInfo] = useState("");

  async function finalizeAndRedirect() {
    await signIn.finalize({
      navigate: ({ decorateUrl }) => {
        const url = decorateUrl("/dashboard");
        if (url.startsWith("http")) {
          window.location.href = url;
        } else {
          router.push(url as "/dashboard");
        }
      },
    });
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setGlobalError("");

    const { error } = await signIn.password({ identifier: email, password });
    if (error) return;

    if (signIn.status === "complete") {
      await finalizeAndRedirect();
    } else {
      setGlobalError("No se pudo completar el inicio de sesión. Intentá de nuevo.");
    }
  }

  async function handleRequestReset(e: FormEvent) {
    e.preventDefault();
    setGlobalError("");

    const { error: createError } = await signIn.create({ identifier: email });
    if (createError) {
      setGlobalError("No encontramos una cuenta con ese correo.");
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.sendCode();
    if (error) {
      setGlobalError("No se pudo enviar el código. Intentá de nuevo.");
      return;
    }

    setInfo(`Te enviamos un código a ${email}.`);
    setMode("reset-verify");
  }

  async function handleSubmitNewPassword(e: FormEvent) {
    e.preventDefault();
    setGlobalError("");

    const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (verifyError) {
      setGlobalError("Código incorrecto. Revisalo e intentá de nuevo.");
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
    });
    if (error) return;

    if (signIn.status === "complete") {
      await finalizeAndRedirect();
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
                {mode === "reset-verify" && "Ingresá el código"}
              </h2>
              <p className="mt-1 text-xs text-white/60">
                {mode === "signin" && "Ingresá tus credenciales para acceder al panel"}
                {mode === "reset-request" && "Te enviaremos un código a tu correo"}
                {mode === "reset-verify" && (info || "Revisá tu bandeja de entrada")}
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
                  {errors?.fields?.identifier && (
                    <p className="mt-1.5 text-xs text-red-300">
                      {errors.fields.identifier.message}
                    </p>
                  )}
                </label>

                <label className="block">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-white/70">Contraseña</span>
                    <button
                      type="button"
                      onClick={() => {
                        setGlobalError("");
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
                  {errors?.fields?.password && (
                    <p className="mt-1.5 text-xs text-red-300">{errors.fields.password.message}</p>
                  )}
                </label>

                {globalError && <p className="text-xs text-red-300">{globalError}</p>}

                <button
                  type="submit"
                  disabled={fetchStatus === "fetching"}
                  className="mt-2 h-12 w-full rounded-xl bg-white font-medium text-[#1D1D1F] transition-all active:scale-[0.98] hover:bg-white/90 disabled:opacity-50"
                >
                  {fetchStatus === "fetching" ? "Ingresando…" : "Ingresar"}
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
                    className={inputClasses}
                  />
                </label>

                {globalError && <p className="text-xs text-red-300">{globalError}</p>}

                <button
                  type="submit"
                  disabled={fetchStatus === "fetching"}
                  className="mt-2 h-12 w-full rounded-xl bg-white font-medium text-[#1D1D1F] transition-all active:scale-[0.98] hover:bg-white/90 disabled:opacity-50"
                >
                  {fetchStatus === "fetching" ? "Enviando…" : "Enviar código"}
                </button>

                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="w-full text-center text-xs font-medium text-white/70 hover:text-white"
                >
                  &larr; Volver a iniciar sesión
                </button>
              </form>
            )}

            {mode === "reset-verify" && (
              <form onSubmit={handleSubmitNewPassword} className="space-y-4" noValidate>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/70">Código</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className={inputClasses}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/70">
                    Nueva contraseña
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className={inputClasses}
                  />
                </label>

                {globalError && <p className="text-xs text-red-300">{globalError}</p>}

                <button
                  type="submit"
                  disabled={fetchStatus === "fetching"}
                  className="mt-2 h-12 w-full rounded-xl bg-white font-medium text-[#1D1D1F] transition-all active:scale-[0.98] hover:bg-white/90 disabled:opacity-50"
                >
                  {fetchStatus === "fetching" ? "Guardando…" : "Restablecer contraseña"}
                </button>

                <button
                  type="button"
                  onClick={() => setMode("signin")}
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
