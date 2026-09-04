"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useSettings } from "@/components/settings-provider";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { ChatBubbleIcon, CloseIcon, SendIcon } from "@/components/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Phase = "chat" | "summary" | "sent";

// Quick-select buttons for the standard steps that have a small, predictable
// set of answers — everything else (name, phone, a specific vehicle model)
// stays free text. Keyed by question id, so a dealership that keeps the
// default ids but edits the question wording still gets the right buttons.
const CUSTOM_BUDGET_OPTION = "Personalizado";
const OPTION_SETS: Record<string, string[]> = {
  timeline: ["Inmediato (Ahora)", "Próximo mes", "En los próximos 6 meses", "Explorando"],
  budget: ["Hasta $35,000", "Hasta $50,000", "Hasta $80,000+", CUSTOM_BUDGET_OPTION],
  financing: ["Contado (Cash)", "Financiado", "Trade-in / Permuta"],
  "trade-in": ["Sí", "No", "Tal vez"],
  "test-drive": ["Sí", "No"],
};

// Best-effort pull of a usable email/phone out of whatever was answered —
// prefers a question explicitly id'd "contact" (the shipped default), but
// falls back to scanning every answer so a dealership that renamed/reordered
// questions doesn't silently lose the hand-off.
function extractContact(answers: Record<string, string>): { email: string; phone: string } {
  const ordered = answers.contact ? [answers.contact, ...Object.values(answers)] : Object.values(answers);
  for (const value of ordered) {
    if (value && EMAIL_RE.test(value.trim())) return { email: value.trim(), phone: "" };
  }
  for (const value of ordered) {
    if (value && value.replace(/\D/g, "").length >= 7) return { email: "", phone: value.trim() };
  }
  return { email: "", phone: "" };
}

export function AgenteWidget() {
  const pathname = usePathname();
  const { settings, loading } = useSettings();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [customBudget, setCustomBudget] = useState(false);
  const [phase, setPhase] = useState<Phase>("chat");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const questions = useMemo(
    () =>
      [...settings.qualificationQuestions].filter((q) => q.enabled).sort((a, b) => a.order - b.order),
    [settings.qualificationQuestions]
  );

  const currentQuestion = questions[step];
  const isLastQuestion = step === questions.length - 1;
  const optionSet =
    currentQuestion && !(currentQuestion.id === "budget" && customBudget)
      ? OPTION_SETS[currentQuestion.id]
      : undefined;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, step, phase, optionSet]);

  // A fresh question never starts in "type a custom budget" mode — only
  // clicking the Personalizado button enters it, per question.
  useEffect(() => {
    setCustomBudget(false);
  }, [step]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [step, phase]);

  // Hide entirely on the dashboard and the login screen — this is a
  // customer-facing concierge, not an admin tool.
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/login")) return null;
  if (loading || questions.length === 0) return null;

  function reset() {
    setStep(0);
    setAnswers({});
    setDraft("");
    setCustomBudget(false);
    setPhase("chat");
    setSubmitError("");
  }

  function handleClose() {
    setOpen(false);
    // Give the close animation a beat before wiping the conversation, so a
    // reopen mid-animation doesn't visibly flash back to the first question.
    setTimeout(reset, 300);
  }

  function commitAnswer(value: string) {
    if (!value || !currentQuestion) return;

    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    setDraft("");

    if (isLastQuestion) {
      setPhase("summary");
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleSend() {
    commitAnswer(draft.trim());
  }

  function handleOptionClick(value: string) {
    // "Personalizado" doesn't answer the budget question by itself — it
    // swaps this step into free-text mode so the visitor can type their own.
    if (currentQuestion?.id === "budget" && value === CUSTOM_BUDGET_OPTION) {
      setCustomBudget(true);
      return;
    }
    commitAnswer(value);
  }

  const { email, phone } = extractContact(answers);
  const canSubmitLead = Boolean(email || phone);
  const visitorName = answers.name?.trim();

  const summaryText = questions
    .map((q) => `${q.text}: ${answers[q.id] ?? "—"}`)
    .join("\n");
  const whatsappMessage = `Hola ${settings.dealershipName}, completé el asistente Agente en el sitio:\n\n${summaryText}`;
  const whatsappUrl = buildWhatsAppLink(settings.whatsappNumber, whatsappMessage);

  async function handleSubmitLead() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: answers.name || "Visitante Agente",
          email,
          phone,
          preferredContact: email ? "Email" : "WhatsApp",
          message: `Consulta generada por Agente:\n\n${summaryText}`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("No se pudo enviar la consulta.");
      setPhase("sent");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No se pudo enviar la consulta.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.3 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#1D1D1F] py-3 pl-4 pr-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-colors hover:bg-black sm:bottom-6 sm:right-6"
        aria-label={open ? "Cerrar Agente" : "Abrir Agente"}
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <ChatBubbleIcon className="h-5 w-5" />
          {!open && (
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34C759] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#34C759]" />
            </span>
          )}
        </span>
        Agente
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="fixed bottom-20 right-5 z-40 flex h-[520px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:bottom-24 sm:right-6"
            style={{ transformOrigin: "bottom right" }}
          >
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-[#F5F5F7]/70 px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1D1D1F] text-white">
                  <ChatBubbleIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1D1D1F]">Agente</p>
                  <p className="text-[11px] text-[#6E6E73]">{settings.dealershipName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#6E6E73] transition-all active:scale-90 hover:bg-black/[0.04] hover:text-[#1D1D1F]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              <AgentBubble>{settings.agenteGreeting}</AgentBubble>

              {questions.slice(0, step).map((q) => (
                <div key={q.id} className="space-y-1.5">
                  <AgentBubble>{q.text}</AgentBubble>
                  <UserBubble>{answers[q.id]}</UserBubble>
                </div>
              ))}

              {phase === "chat" && currentQuestion && (
                <AgentBubble>{currentQuestion.text}</AgentBubble>
              )}

              {phase === "summary" && (
                <>
                  {currentQuestion && (
                    <div className="space-y-1.5">
                      <AgentBubble>{currentQuestion.text}</AgentBubble>
                      <UserBubble>{answers[currentQuestion.id]}</UserBubble>
                    </div>
                  )}
                  <AgentBubble>
                    {visitorName ? `¡Muchas gracias, ${visitorName}!` : "¡Muchas gracias!"} Ya tengo
                    todo lo que necesito — hemos registrado tu consulta. ¿Cómo preferís continuar?
                  </AgentBubble>
                </>
              )}

              {phase === "sent" && (
                <AgentBubble>
                  {visitorName ? `¡Listo, ${visitorName}!` : "¡Listo!"} Tu consulta llegó a nuestro
                  equipo — te vamos a contactar a la brevedad. ¡Gracias!
                </AgentBubble>
              )}
            </div>

            <div className="border-t border-black/[0.06] p-3">
              {phase === "chat" && optionSet ? (
                <div className="flex flex-wrap gap-2">
                  {optionSet.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleOptionClick(option)}
                      className="rounded-full border border-black/10 bg-[#F5F5F7] px-3.5 py-2 text-xs font-semibold text-[#1D1D1F] transition-all active:scale-[0.97] hover:border-[#0071E3] hover:bg-[#0071E3]/5 hover:text-[#0071E3]"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : phase === "chat" ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Escribí tu respuesta…"
                    className="flex-1 rounded-full border border-black/10 bg-[#F5F5F7] px-4 py-2.5 text-sm text-[#1D1D1F] outline-none transition-colors focus:border-[#0071E3] focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    aria-label="Enviar"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0071E3] text-white transition-all active:scale-90 disabled:opacity-30"
                  >
                    <SendIcon className="h-4 w-4" />
                  </button>
                </form>
              ) : phase === "summary" ? (
                <div className="space-y-2">
                  {submitError && <p className="text-xs text-red-600">{submitError}</p>}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#20BD5A]"
                  >
                    Continuar por WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={handleSubmitLead}
                    disabled={submitting || !canSubmitLead}
                    title={canSubmitLead ? undefined : "Necesitamos un email o teléfono para enviar la consulta"}
                    className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-[#1D1D1F] transition-all active:scale-[0.98] hover:border-[#0071E3] hover:text-[#0071E3] disabled:opacity-40"
                  >
                    {submitting ? "Enviando…" : "Enviar consulta al equipo"}
                  </button>
                </div>
              ) : (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#20BD5A]"
                >
                  Seguir por WhatsApp
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AgentBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-[#F5F5F7] px-3.5 py-2.5 text-sm text-[#1D1D1F]">
      {children}
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#0071E3] px-3.5 py-2.5 text-right text-sm text-white">
      {children}
    </div>
  );
}
