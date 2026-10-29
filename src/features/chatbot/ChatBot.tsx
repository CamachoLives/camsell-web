import { Bot, ChevronDown, Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/shared/lib/cn'

/* ── Knowledge base ─────────────────────────────────────────────────────── */

interface QA {
  patterns: RegExp[]
  answer: string
  quick?: string[]
}

const KB: QA[] = [
  {
    patterns: [/hola|hi|buenos|buenas|hey/i],
    answer:
      '¡Hola! Soy el asistente de Camsell 🚗 Puedo ayudarte a entender cómo funciona la plataforma, cómo publicar tu vehículo o cómo hacer una oferta. ¿Qué necesitas?',
    quick: ['¿Cómo publico?', '¿Cómo hago una oferta?', '¿Es gratis?'],
  },
  {
    patterns: [/publicar|vender|anuncio|listing/i],
    answer:
      'Publicar es **100% gratis** y sin comisiones. Solo necesitas:\n1. Crear una cuenta (toma menos de un minuto)\n2. Ir a "Publicar" en el menú\n3. Elegir marca, modelo, año y precio\n4. Subir fotos y una descripción\n¡Listo! Tu vehículo queda visible de inmediato.',
    quick: ['¿Cómo hago una oferta?', '¿Cómo filtro vehículos?'],
  },
  {
    patterns: [/oferta|negociar|comprar|precio/i],
    answer:
      'Para hacer una oferta:\n1. Abre la ficha del vehículo que te interesa\n2. Haz clic en **"Hacer una oferta"**\n3. Escribe el monto que ofreces y un mensaje opcional\n\nEl vendedor puede aceptar, rechazar o ignorar tu oferta. Si la acepta, el vehículo queda reservado para ti.',
    quick: ['¿Es gratis publicar?', '¿Cómo contacto al vendedor?'],
  },
  {
    patterns: [/gratis|costo|comisi[oó]n|cobr/i],
    answer:
      'Camsell **no cobra nada**. Publicar es gratis, hacer ofertas es gratis y no hay comisión por la venta. El negocio lo cierras directamente con el vendedor.',
    quick: ['¿Cómo publico?', '¿Cómo hago una oferta?'],
  },
  {
    patterns: [/filtro|buscar|busqueda|encontrar|marca|modelo/i],
    answer:
      'En el catálogo puedes filtrar por:\n• **Marca** y modelo\n• Año, precio y kilometraje\n• Tipo de carrocería (SUV, sedán, pick-up...)\n• Combustible (gasolina, diésel, híbrido, eléctrico)\n• Transmisión, ciudad y más\n\nTambién puedes usar **Ctrl+K** (o ⌘K en Mac) para buscar cualquier cosa al instante.',
    quick: ['¿Cómo hago una oferta?', '¿Es gratis?'],
  },
  {
    patterns: [/contactar|tel[eé]fono|whatsapp|vendedor/i],
    answer:
      'En la ficha de cada vehículo verás el nombre del vendedor. Si haces una oferta y el vendedor la acepta, puedes coordinarse el pago y la entrega directamente. El teléfono del vendedor aparece en su perfil si lo registró.',
    quick: ['¿Cómo hago una oferta?'],
  },
  {
    patterns: [/favoritos|guardar|lista/i],
    answer:
      'Puedes guardar vehículos en favoritos haciendo clic en el corazón ❤️ en la ficha del vehículo. Para verlos, ve a **Mi cuenta → Favoritos**. Necesitas estar ingresado.',
    quick: ['¿Cómo ingreso?', '¿Cómo hago una oferta?'],
  },
  {
    patterns: [/ingresar|login|cuenta|registr|contrase[ñn]/i],
    answer:
      'Para crear tu cuenta ve a **"Crear cuenta"** en la esquina superior derecha. Solo necesitas nombre, correo y contraseña. Si ya tienes cuenta, haz clic en **"Ingresar"**.\n\n¿Quieres probar sin registrarte? En la pantalla de ingreso hay cuentas de demostración.',
    quick: ['¿Es gratis?', '¿Cómo publico?'],
  },
  {
    patterns: [/concesionario|dealer|empresa/i],
    answer:
      'Sí, Camsell tiene cuentas para **concesionarios** (tipo "Dealer"). Al registrarte puedes elegir ese tipo de cuenta. Los compradores ven el rol del vendedor en cada publicación para saber con quién negocian.',
    quick: ['¿Cómo publico?'],
  },
  {
    patterns: [/noticia|mercado|autopart|informaci[oó]n/i],
    answer:
      'La sección **Noticias** de Camsell tiene artículos del mercado automotor colombiano: precios, tendencias y consejos. La encuentras en el menú principal.',
    quick: ['¿Cómo filtro vehículos?'],
  },
]

const DEFAULT_ANSWER =
  'Hmm, no estoy seguro de cómo responder eso. Puedes escribirme sobre cómo publicar, hacer ofertas, filtrar vehículos o crear tu cuenta. ¿En qué te ayudo?'

function findAnswer(input: string): { answer: string; quick?: string[] } {
  for (const qa of KB) {
    if (qa.patterns.some((p) => p.test(input))) {
      return { answer: qa.answer, quick: qa.quick }
    }
  }
  return { answer: DEFAULT_ANSWER }
}

/* ── Types ──────────────────────────────────────────────────────────────── */

interface Message {
  id: number
  role: 'user' | 'bot'
  text: string
  quick?: string[]
}

let msgId = 1

/* ── Component ──────────────────────────────────────────────────────────── */

export function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: msgId++,
      role: 'bot',
      text: '¡Hola! Soy el asistente de Camsell. ¿En qué puedo ayudarte hoy?',
      quick: ['¿Cómo publico mi vehículo?', '¿Cómo hago una oferta?', '¿Es gratis?'],
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  function send(text: string) {
    if (!text.trim()) return
    const userMsg: Message = { id: msgId++, role: 'user', text: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    // Simulated thinking delay for natural feel
    const delay = 500 + Math.random() * 500
    window.setTimeout(() => {
      const { answer, quick } = findAnswer(text)
      setMessages((prev) => [...prev, { id: msgId++, role: 'bot', text: answer, quick }])
      setTyping(false)
    }, delay)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente de Camsell'}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'fixed bottom-20 right-6 z-50 grid size-13 place-items-center rounded-full shadow-lift transition-all duration-300',
          'bg-brand-600 text-white hover:bg-brand-500 active:scale-95',
          open && 'rotate-45',
        )}
      >
        {open ? <X className="size-5" aria-hidden /> : <Bot className="size-6" aria-hidden />}
      </button>

      {/* Chat panel */}
      {open ? (
        <div
          role="dialog"
          aria-label="Asistente Camsell"
          aria-modal="false"
          className={cn(
            'fixed bottom-36 right-6 z-50 flex w-[22rem] flex-col',
            'surface-glass rounded-panel shadow-2xl overflow-hidden',
            'animate-pop',
          )}
          style={{ height: '26rem' }}
        >
          {/* Header */}
          <div className="bg-brand-600 flex items-center gap-3 px-4 py-3">
            <Bot className="size-5 text-white" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Asistente Camsell</p>
              <p className="text-[0.65rem] text-brand-200">Siempre disponible</p>
            </div>
            <button
              type="button"
              aria-label="Minimizar"
              onClick={() => setOpen(false)}
              className="text-brand-200 hover:text-white transition-colors"
            >
              <ChevronDown className="size-4" aria-hidden />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-sm'
                      : 'surface-card rounded-bl-sm',
                  )}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  {msg.quick && msg.role === 'bot' ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.quick.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => send(q)}
                          className="border-brand-300 text-brand-700 dark:text-brand-300 rounded-full border px-2.5 py-1 text-[0.65rem] font-medium hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {typing ? (
              <div className="flex justify-start">
                <div className="surface-card flex items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-3">
                  <span className="bg-brand-400 size-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
                  <span className="bg-brand-400 size-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
                  <span className="bg-brand-400 size-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-surface p-3 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Escribe tu pregunta…"
              rows={1}
              className={cn(
                'flex-1 resize-none rounded-xl border border-surface bg-surface-sunken px-3 py-2',
                'text-sm outline-none focus:border-brand-400 transition-colors',
                'placeholder:text-muted/60',
              )}
              style={{ maxHeight: '6rem' }}
            />
            <button
              type="button"
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
              aria-label="Enviar"
              className={cn(
                'grid size-9 shrink-0 place-items-center rounded-xl transition-colors',
                input.trim() && !typing
                  ? 'bg-brand-600 text-white hover:bg-brand-500'
                  : 'bg-surface-sunken text-muted cursor-not-allowed',
              )}
            >
              <Send className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
