import { Handshake } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useSubmitOffer } from '@/features/offers/hooks'
import { ApiError } from '@/shared/api/client'
import type { ListingDetail } from '@/shared/api/types'
import { formatPrice } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { TextAreaField, TextField } from '@/shared/ui/Field'
import { InlineAlert } from '@/shared/ui/Feedback'
import { Modal } from '@/shared/ui/Modal'
import { useToast } from '@/shared/ui/toast'

/** El backend exige al menos el 40 % del precio publicado. */
const MIN_RATIO = 0.4

interface OfferForm {
  amount: number
  message: string
  contactPhone: string
}

interface OfferDialogProps {
  listing: ListingDetail
  open: boolean
  onClose: () => void
}

export function OfferDialog({ listing, open, onClose }: OfferDialogProps) {
  const submitOffer = useSubmitOffer(listing.id)
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)

  const minimum = Math.ceil(listing.price * MIN_RATIO)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OfferForm>({
    defaultValues: {
      amount: Math.round(listing.price * 0.95),
      message: '',
      contactPhone: '',
    },
  })

  const amount = Number(watch('amount')) || 0

  async function onSubmit(values: OfferForm) {
    setFormError(null)
    try {
      await submitOffer.mutateAsync({
        amount: Number(values.amount),
        currency: listing.currency,
        message: values.message || undefined,
        contactPhone: values.contactPhone || undefined,
      })
      toast.success('Oferta enviada. El vendedor la verá en su panel.')
      reset()
      onClose()
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'No pudimos enviar tu oferta. Intenta de nuevo.',
      )
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Hacer una oferta"
      description={`${listing.title} · publicado en ${formatPrice(listing.price, listing.currency)}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            form="offer-form"
            type="submit"
            loading={isSubmitting}
            icon={<Handshake className="size-4" />}
          >
            Enviar oferta
          </Button>
        </>
      }
    >
      <form id="offer-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {formError ? <InlineAlert>{formError}</InlineAlert> : null}

        <TextField
          label="Tu oferta"
          type="number"
          inputMode="numeric"
          min={minimum}
          step={100_000}
          required
          hint={`Mínimo aceptado: ${formatPrice(minimum, listing.currency)}`}
          error={errors.amount?.message}
          {...register('amount', {
            required: 'Indica cuánto ofreces',
            valueAsNumber: true,
            min: {
              value: minimum,
              message: `La oferta debe ser al menos ${formatPrice(minimum, listing.currency)}`,
            },
          })}
        />

        {amount > 0 && amount >= minimum ? (
          <p className="text-muted text-sm">
            Tu oferta es{' '}
            <strong className="text-strong">
              {Math.round((amount / listing.price) * 100)}%
            </strong>{' '}
            del precio publicado
            {amount < listing.price
              ? `, ${formatPrice(listing.price - amount, listing.currency)} por debajo.`
              : '.'}
          </p>
        ) : null}

        <TextAreaField
          label="Mensaje para el vendedor"
          rows={4}
          maxLength={1000}
          placeholder="Cuéntale si pagas de contado, si tienes crédito aprobado o cuándo puedes ver el vehículo."
          hint="Opcional, pero las ofertas con mensaje reciben más respuestas."
          error={errors.message?.message}
          {...register('message', { maxLength: { value: 1000, message: 'Máximo 1000 caracteres' } })}
        />

        <TextField
          label="Teléfono de contacto"
          type="tel"
          placeholder="+57 300 000 0000"
          hint="Si lo dejas vacío usamos el de tu perfil."
          error={errors.contactPhone?.message}
          {...register('contactPhone')}
        />

        {listing.negotiable ? (
          <InlineAlert tone="info">
            El vendedor marcó este precio como negociable.
          </InlineAlert>
        ) : null}
      </form>
    </Modal>
  )
}
