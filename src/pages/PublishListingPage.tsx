import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check, ImagePlus, Trash2, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { listingsApi } from '@/features/listings/api'
import {
  toAttributeInputs,
  validateRequired,
  type DynamicValues,
} from '@/features/parameters/attributes'
import { DynamicField } from '@/features/parameters/DynamicField'
import { useBrands, usePublishableGroups } from '@/features/parameters/hooks'
import { ApiError } from '@/shared/api/client'
import type { SaveListingInput } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { formatPrice } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { CheckboxField, SelectField, TextAreaField, TextField } from '@/shared/ui/Field'
import { InlineAlert, Skeleton } from '@/shared/ui/Feedback'
import { useToast } from '@/shared/ui/toast'

const STEPS = ['Vehículo', 'Características', 'Precio y fotos'] as const
const CURRENT_YEAR = new Date().getFullYear()

interface BasicState {
  brandId: string
  modelId: string
  year: string
  mileageKm: string
  title: string
}

interface PriceState {
  price: string
  negotiable: boolean
  description: string
}

export function PublishListingPage() {
  const { groups, isLoading } = usePublishableGroups()
  const { data: brands } = useBrands()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()

  const [step, setStep] = useState(0)
  const [basic, setBasic] = useState<BasicState>({
    brandId: '',
    modelId: '',
    year: String(CURRENT_YEAR),
    mileageKm: '',
    title: '',
  })
  const [price, setPrice] = useState<PriceState>({
    price: '',
    negotiable: true,
    description: '',
  })
  const [attributes, setAttributes] = useState<DynamicValues>({})
  const [images, setImages] = useState<string[]>([''])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const selectedBrand = brands?.find((brand) => brand.id === Number(basic.brandId))
  // La ciudad es un grupo de parámetros como cualquier otro; se pide en el paso
  // uno porque es parte de la identidad del vehículo, no de sus características.
  const cityGroup = groups.find((group) => group.code === 'CITY')
  const featureGroups = useMemo(
    () => groups.filter((group) => group.code !== 'CITY'),
    [groups],
  )

  const publish = useMutation({
    mutationFn: (input: SaveListingInput) => listingsApi.create(input),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['listings'] })
      toast.success(
        created.status === 'PUBLISHED'
          ? 'Tu vehículo ya está publicado'
          : 'Guardamos tu borrador',
      )
      navigate(created.status === 'PUBLISHED' ? `/vehiculos/${created.slug}` : '/cuenta')
    },
  })

  function validateStepOne(): boolean {
    const next: Record<string, string> = {}
    if (!basic.brandId) next.brandId = 'Elige la marca'
    if (!basic.modelId) next.modelId = 'Elige el modelo'
    const year = Number(basic.year)
    if (!year || year < 1950 || year > CURRENT_YEAR + 1) {
      next.year = `El año debe estar entre 1950 y ${CURRENT_YEAR + 1}`
    }
    if (basic.mileageKm === '' || Number(basic.mileageKm) < 0) {
      next.mileageKm = 'Indica el kilometraje'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function validateStepTwo(): boolean {
    const next = validateRequired(featureGroups, attributes)
    if (cityGroup?.requiredForListing && !attributes.CITY) {
      next.CITY = 'La ciudad es obligatoria'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function validateStepThree(): boolean {
    const next: Record<string, string> = {}
    if (!price.price || Number(price.price) <= 0) {
      next.price = 'Indica el precio de venta'
    }
    if (price.description.trim().length < 40) {
      next.description = 'La descripción debe tener al menos 40 caracteres'
    }
    if (cleanImages().length === 0) {
      next.images = 'Agrega al menos una imagen para publicar'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function cleanImages(): string[] {
    return images.map((url) => url.trim()).filter(Boolean)
  }

  function goNext() {
    const valid = step === 0 ? validateStepOne() : step === 1 ? validateStepTwo() : true
    if (valid) {
      setErrors({})
      setStep((value) => Math.min(value + 1, STEPS.length - 1))
    }
  }

  async function submit(publishNow: boolean) {
    setFormError(null)
    if (publishNow && !validateStepThree()) {
      return
    }
    if (!publishNow && (!price.price || Number(price.price) <= 0)) {
      setErrors({ price: 'Indica el precio, incluso para guardar el borrador' })
      return
    }

    const input: SaveListingInput = {
      brandId: Number(basic.brandId),
      modelId: Number(basic.modelId),
      title: basic.title.trim() || null,
      year: Number(basic.year),
      mileageKm: Number(basic.mileageKm),
      price: Number(price.price),
      currency: 'COP',
      negotiable: price.negotiable,
      description: price.description.trim(),
      cityCode: typeof attributes.CITY === 'string' ? attributes.CITY : null,
      publishNow,
      images: cleanImages().map((url, index) => ({ url, alt: basic.title || null, position: index })),
      attributes: toAttributeInputs(groups, attributes),
    }

    try {
      await publish.mutateAsync(input)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fieldIssues.length > 0) {
          setErrors(
            Object.fromEntries(error.fieldIssues.map((issue) => [issue.field, issue.message])),
          )
        }
        setFormError(error.message)
        return
      }
      setFormError('No pudimos guardar tu publicación. Intenta de nuevo.')
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-12">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-72 w-full rounded-panel" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      <header className="mb-7">
        <h1 className="text-3xl font-semibold">Publica tu vehículo</h1>
        <p className="text-muted mt-1.5">
          Tres pasos. Los campos de características los define el catálogo de parámetros de la
          plataforma.
        </p>
      </header>

      <ol className="mb-8 flex items-center gap-2">
        {STEPS.map((label, index) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => index < step && setStep(index)}
              disabled={index > step}
              className={cn(
                'flex items-center gap-2 text-sm font-medium transition-colors',
                index === step
                  ? 'text-brand-700 dark:text-brand-300'
                  : index < step
                    ? 'text-muted hover:text-strong'
                    : 'text-muted/60',
              )}
            >
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold',
                  index === step
                    ? 'bg-brand-600 text-white'
                    : index < step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-surface-sunken text-muted',
                )}
              >
                {index < step ? <Check className="size-3.5" aria-hidden /> : index + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {index < STEPS.length - 1 ? (
              <span className="bg-surface-border h-px flex-1" aria-hidden />
            ) : null}
          </li>
        ))}
      </ol>

      <div className="surface-card rounded-panel p-6 sm:p-8">
        {formError ? (
          <div className="mb-5">
            <InlineAlert>{formError}</InlineAlert>
          </div>
        ) : null}

        {step === 0 ? (
          <div className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Marca"
                required
                error={errors.brandId}
                value={basic.brandId}
                onChange={(event) =>
                  setBasic((state) => ({ ...state, brandId: event.target.value, modelId: '' }))
                }
              >
                <option value="">Selecciona la marca</option>
                {brands?.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Modelo"
                required
                error={errors.modelId}
                disabled={!selectedBrand}
                hint={selectedBrand ? undefined : 'Elige primero la marca'}
                value={basic.modelId}
                onChange={(event) => setBasic((state) => ({ ...state, modelId: event.target.value }))}
              >
                <option value="">Selecciona el modelo</option>
                {selectedBrand?.models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Año del modelo"
                type="number"
                inputMode="numeric"
                min={1950}
                max={CURRENT_YEAR + 1}
                required
                error={errors.year}
                value={basic.year}
                onChange={(event) => setBasic((state) => ({ ...state, year: event.target.value }))}
              />
              <TextField
                label="Kilometraje"
                type="number"
                inputMode="numeric"
                min={0}
                required
                hint="En kilómetros"
                error={errors.mileageKm}
                value={basic.mileageKm}
                onChange={(event) =>
                  setBasic((state) => ({ ...state, mileageKm: event.target.value }))
                }
              />
            </div>

            {cityGroup ? (
              <DynamicField
                group={cityGroup}
                value={attributes.CITY}
                error={errors.CITY}
                onChange={(value) => setAttributes((state) => ({ ...state, CITY: value }))}
              />
            ) : null}

            <TextField
              label="Título de la publicación"
              hint="Opcional. Si lo dejas vacío lo armamos con marca, modelo y año."
              maxLength={200}
              value={basic.title}
              onChange={(event) => setBasic((state) => ({ ...state, title: event.target.value }))}
            />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-6">
            <p className="text-muted text-sm">
              Los campos marcados con <span className="text-red-600">*</span> son obligatorios para
              publicar. Esta lista la define el administrador de la plataforma.
            </p>
            {featureGroups.map((group) => (
              <DynamicField
                key={group.code}
                group={group}
                value={attributes[group.code]}
                error={errors[group.code]}
                onChange={(value) =>
                  setAttributes((state) => ({ ...state, [group.code]: value }))
                }
              />
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-5">
            <TextField
              label="Precio de venta"
              type="number"
              inputMode="numeric"
              min={1}
              step={100_000}
              required
              error={errors.price}
              hint={
                price.price && Number(price.price) > 0
                  ? formatPrice(Number(price.price))
                  : 'En pesos colombianos'
              }
              value={price.price}
              onChange={(event) => setPrice((state) => ({ ...state, price: event.target.value }))}
            />

            <CheckboxField
              label="Acepto recibir ofertas"
              hint="Los compradores podrán proponer un precio distinto al publicado."
              checked={price.negotiable}
              onChange={(event) =>
                setPrice((state) => ({ ...state, negotiable: event.target.checked }))
              }
            />

            <TextAreaField
              label="Descripción"
              rows={6}
              required
              maxLength={6000}
              error={errors.description}
              hint={`${price.description.trim().length} de 40 caracteres mínimos`}
              placeholder="Cuenta el estado real del vehículo, mantenimientos, si tuvo choques, qué incluye la entrega…"
              value={price.description}
              onChange={(event) =>
                setPrice((state) => ({ ...state, description: event.target.value }))
              }
            />

            <ImagesEditor
              images={images}
              error={errors.images}
              onChange={setImages}
              title={basic.title}
            />
          </div>
        ) : null}
      </div>

      <nav className="mt-6 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          disabled={step === 0}
          icon={<ArrowLeft className="size-4" />}
          onClick={() => setStep((value) => Math.max(0, value - 1))}
        >
          Atrás
        </Button>

        {step < STEPS.length - 1 ? (
          <Button icon={<ArrowRight className="size-4" />} onClick={goNext}>
            Continuar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              loading={publish.isPending}
              onClick={() => void submit(false)}
            >
              Guardar borrador
            </Button>
            <Button
              loading={publish.isPending}
              icon={<Upload className="size-4" />}
              onClick={() => void submit(true)}
            >
              Publicar
            </Button>
          </div>
        )}
      </nav>
    </div>
  )
}

/** Editor de imágenes por URL, con vista previa y orden. */
function ImagesEditor({
  images,
  error,
  onChange,
  title,
}: {
  images: string[]
  error?: string
  onChange: (images: string[]) => void
  title: string
}) {
  function update(index: number, value: string) {
    onChange(images.map((url, position) => (position === index ? value : url)))
  }

  function addSample() {
    // Atajo para la demostración: genera URLs de imágenes de ejemplo estables.
    const seed = (title || 'camsell').toLowerCase().replace(/\s+/g, '-')
    onChange([
      ...images.filter(Boolean),
      `https://picsum.photos/seed/${seed}-${images.length + 1}/1280/860`,
    ])
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <legend className="text-strong text-sm font-medium">
            Imágenes
            <span className="ml-0.5 text-red-600" aria-hidden>
              *
            </span>
          </legend>
          <p className="text-muted text-xs">
            Pega la URL de cada foto. La primera es la portada de la publicación.
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          icon={<ImagePlus className="size-3.5" />}
          onClick={addSample}
        >
          Imagen de ejemplo
        </Button>
      </div>

      <ul className="flex flex-col gap-2.5">
        {images.map((url, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="bg-surface-sunken mt-1 grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg">
              {url.trim() ? (
                <img src={url} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-muted text-xs">{index + 1}</span>
              )}
            </span>
            <TextField
              wrapperClassName="flex-1"
              label={index === 0 ? 'Portada' : `Imagen ${index + 1}`}
              type="url"
              placeholder="https://…"
              value={url}
              onChange={(event) => update(index, event.target.value)}
            />
            {images.length > 1 ? (
              <button
                type="button"
                onClick={() => onChange(images.filter((_, position) => position !== index))}
                aria-label={`Quitar imagen ${index + 1}`}
                className="text-muted mt-7 rounded-lg p-2 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      <Button size="sm" variant="secondary" onClick={() => onChange([...images, ''])}>
        Agregar otra imagen
      </Button>

      {error ? (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
