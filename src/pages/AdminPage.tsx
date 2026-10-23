import {
  Boxes,
  ChevronDown,
  ListTree,
  Newspaper,
  Plus,
  Settings,
  Trash2,
  Upload,
} from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { GroupPayload, OptionPayload } from '@/features/admin/api'
import {
  useAdminBrands,
  useAdminGroups,
  useBrandMutations,
  useParameterMutations,
} from '@/features/admin/hooks'
import { useAdminNews, useArticleMutations } from '@/features/news/hooks'
import { useParameterGroups } from '@/features/parameters/hooks'
import { ApiError } from '@/shared/api/client'
import type {
  ArticleStatus,
  Brand,
  ParameterDataType,
  ParameterGroup,
  ParameterScope,
  SaveArticleInput,
} from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { formatDateShort } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { CheckboxField, SelectField, TextAreaField, TextField } from '@/shared/ui/Field'
import { EmptyState, ErrorState, InlineAlert, Skeleton } from '@/shared/ui/Feedback'
import { Modal } from '@/shared/ui/Modal'
import { useToast } from '@/shared/ui/toast'

const TABS = [
  { id: 'parametros', label: 'Parámetros', icon: ListTree },
  { id: 'marcas', label: 'Marcas y modelos', icon: Boxes },
  { id: 'noticias', label: 'Noticias', icon: Newspaper },
] as const

type TabId = (typeof TABS)[number]['id']

export function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('tab') as TabId | null
  const active: TabId = TABS.some((tab) => tab.id === requested) ? requested! : 'parametros'

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <header className="mb-7">
        <p className="text-brand-700 dark:text-brand-300 inline-flex items-center gap-1.5 text-sm font-semibold">
          <Settings className="size-4" aria-hidden />
          Administración
        </p>
        <h1 className="mt-1.5 text-3xl font-semibold sm:text-4xl">Configuración de la plataforma</h1>
        <p className="text-muted mt-1.5">
          Lo que cambies aquí se refleja de inmediato en los filtros de búsqueda, en el formulario
          de publicación y en las fichas técnicas.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Secciones de administración"
        className="mb-7 flex gap-1 overflow-x-auto border-b border-surface pb-px"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={active === id}
            onClick={() => {
              const next = new URLSearchParams(searchParams)
              if (id === 'parametros') {
                next.delete('tab')
              } else {
                next.set('tab', id)
              }
              setSearchParams(next, { replace: true })
            }}
            className={cn(
              '-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
              active === id
                ? 'border-brand-600 text-brand-700 dark:text-brand-300'
                : 'text-muted hover:text-strong border-transparent',
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {active === 'parametros' ? <ParametersTab /> : null}
      {active === 'marcas' ? <BrandsTab /> : null}
      {active === 'noticias' ? <NewsTab /> : null}
    </div>
  )
}

/* ── Parámetros ─────────────────────────────────────────────────────────── */

const DATA_TYPES: { value: ParameterDataType; label: string; hint: string }[] = [
  { value: 'OPTION', label: 'Opciones', hint: 'Se elige entre valores administrados' },
  { value: 'TEXT', label: 'Texto', hint: 'Texto libre' },
  { value: 'NUMBER', label: 'Número', hint: 'Valor numérico' },
  { value: 'BOOLEAN', label: 'Sí / No', hint: 'Casilla de verificación' },
]

const SCOPES: { value: ParameterScope; label: string }[] = [
  { value: 'LISTING', label: 'Catálogo de vehículos' },
  { value: 'NEWS', label: 'Sección informativa' },
  { value: 'GENERAL', label: 'Transversal' },
]

function ParametersTab() {
  const { data: groups, isPending, isError, error, refetch } = useAdminGroups()
  const mutations = useParameterMutations()
  const toast = useToast()
  const [editing, setEditing] = useState<ParameterGroup | null>(null)
  const [creating, setCreating] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function onDeleteGroup(group: ParameterGroup) {
    if (!window.confirm(`¿Eliminar el grupo ${group.code}?`)) {
      return
    }
    try {
      await mutations.deleteGroup.mutateAsync(group.code)
      toast.success('Grupo eliminado')
    } catch (caught) {
      // El backend impide borrar un grupo con opciones; el mensaje lo explica.
      toast.error(caught instanceof ApiError ? caught.message : 'No pudimos eliminar el grupo')
    }
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }
  if (isPending) {
    return <Skeleton className="h-72 w-full rounded-panel" />
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-muted text-sm">
          {groups.length} grupos configurados
        </p>
        <Button icon={<Plus className="size-4" />} onClick={() => setCreating(true)}>
          Nuevo grupo
        </Button>
      </div>

      <ul className="flex flex-col gap-3">
        {groups.map((group) => (
          <li key={group.code} className="surface-card overflow-hidden rounded-panel">
            <div className="flex flex-wrap items-start justify-between gap-3 p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{group.name}</h3>
                  <code className="bg-surface-sunken text-muted rounded px-1.5 py-0.5 text-xs">
                    {group.code}
                  </code>
                  {!group.active ? <Badge tone="neutral">Inactivo</Badge> : null}
                </div>
                {group.description ? (
                  <p className="text-muted mt-1 text-sm">{group.description}</p>
                ) : null}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <Badge tone="info">{DATA_TYPES.find((t) => t.value === group.dataType)?.label}</Badge>
                  <Badge>{SCOPES.find((s) => s.value === group.scope)?.label}</Badge>
                  {group.filterable ? <Badge tone="brand">Filtrable</Badge> : null}
                  {group.requiredForListing ? <Badge tone="warning">Obligatorio</Badge> : null}
                  {group.multiValued ? <Badge>Multivalor</Badge> : null}
                  {group.showInSpecs ? <Badge>En ficha técnica</Badge> : null}
                </div>
              </div>

              <div className="flex shrink-0 gap-1.5">
                {group.dataType === 'OPTION' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={
                      <ChevronDown
                        className={cn(
                          'size-3.5 transition-transform',
                          expanded === group.code && 'rotate-180',
                        )}
                      />
                    }
                    onClick={() => setExpanded(expanded === group.code ? null : group.code)}
                  >
                    {group.options.length} opciones
                  </Button>
                ) : null}
                <Button size="sm" variant="ghost" onClick={() => setEditing(group)}>
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Trash2 className="size-3.5" />}
                  onClick={() => void onDeleteGroup(group)}
                >
                  <span className="sr-only">Eliminar grupo</span>
                </Button>
              </div>
            </div>

            {expanded === group.code ? <OptionsEditor group={group} /> : null}
          </li>
        ))}
      </ul>

      {creating || editing ? (
        <GroupForm
          group={editing}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
        />
      ) : null}
    </>
  )
}

function GroupForm({ group, onClose }: { group: ParameterGroup | null; onClose: () => void }) {
  const mutations = useParameterMutations()
  const toast = useToast()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<GroupPayload>({
    code: group?.code ?? '',
    name: group?.name ?? '',
    description: group?.description ?? '',
    dataType: group?.dataType ?? 'OPTION',
    scope: group?.scope ?? 'LISTING',
    multiValued: group?.multiValued ?? false,
    filterable: group?.filterable ?? true,
    requiredForListing: group?.requiredForListing ?? false,
    showInSpecs: group?.showInSpecs ?? true,
    sortOrder: group?.sortOrder ?? 100,
    active: group?.active ?? true,
  })

  const saving = mutations.createGroup.isPending || mutations.updateGroup.isPending

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      if (group) {
        await mutations.updateGroup.mutateAsync({ code: group.code, payload: form })
        toast.success('Grupo actualizado')
      } else {
        await mutations.createGroup.mutateAsync(form)
        toast.success('Grupo creado. Ya aparece en los filtros y en el formulario.')
      }
      onClose()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'No pudimos guardar el grupo')
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={group ? `Editar ${group.name}` : 'Nuevo grupo de parámetros'}
      description="Define cómo se comporta este campo en toda la plataforma."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="group-form" type="submit" loading={saving}>
            Guardar
          </Button>
        </>
      }
    >
      <form id="group-form" onSubmit={submit} className="flex flex-col gap-4">
        {error ? <InlineAlert>{error}</InlineAlert> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Código"
            required
            disabled={Boolean(group)}
            hint="MAYUSCULAS_CON_GUION_BAJO"
            placeholder="TECHO_SOLAR"
            value={form.code}
            onChange={(event) =>
              setForm((state) => ({ ...state, code: event.target.value.toUpperCase() }))
            }
          />
          <TextField
            label="Nombre visible"
            required
            placeholder="Techo solar"
            value={form.name}
            onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))}
          />
        </div>

        <TextAreaField
          label="Descripción"
          rows={2}
          maxLength={400}
          hint="Se muestra como ayuda bajo el campo"
          value={form.description ?? ''}
          onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Tipo de dato"
            hint={DATA_TYPES.find((type) => type.value === form.dataType)?.hint}
            value={form.dataType}
            onChange={(event) =>
              setForm((state) => ({
                ...state,
                dataType: event.target.value as ParameterDataType,
                // Solo los grupos de opciones admiten varios valores.
                multiValued: event.target.value === 'OPTION' ? state.multiValued : false,
              }))
            }
          >
            {DATA_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Ámbito"
            hint="Dónde aplica este grupo"
            value={form.scope}
            onChange={(event) =>
              setForm((state) => ({ ...state, scope: event.target.value as ParameterScope }))
            }
          >
            {SCOPES.map((scope) => (
              <option key={scope.value} value={scope.value}>
                {scope.label}
              </option>
            ))}
          </SelectField>
        </div>

        <TextField
          label="Orden"
          type="number"
          hint="Menor número aparece primero"
          value={form.sortOrder ?? 100}
          onChange={(event) =>
            setForm((state) => ({ ...state, sortOrder: Number(event.target.value) }))
          }
        />

        <div className="flex flex-col gap-3 border-t border-surface pt-4">
          <CheckboxField
            label="Filtrable en la búsqueda"
            hint="Aparece como filtro en el catálogo"
            checked={form.filterable}
            onChange={(event) => setForm((state) => ({ ...state, filterable: event.target.checked }))}
          />
          <CheckboxField
            label="Obligatorio para publicar"
            hint="El vendedor no puede publicar sin llenarlo"
            checked={form.requiredForListing}
            onChange={(event) =>
              setForm((state) => ({ ...state, requiredForListing: event.target.checked }))
            }
          />
          <CheckboxField
            label="Mostrar en la ficha técnica"
            checked={form.showInSpecs}
            onChange={(event) => setForm((state) => ({ ...state, showInSpecs: event.target.checked }))}
          />
          <CheckboxField
            label="Admite varios valores"
            hint="Solo para grupos de opciones, como el equipamiento"
            disabled={form.dataType !== 'OPTION'}
            checked={form.multiValued}
            onChange={(event) =>
              setForm((state) => ({ ...state, multiValued: event.target.checked }))
            }
          />
          <CheckboxField
            label="Activo"
            hint="Un grupo inactivo desaparece de la interfaz sin borrar datos"
            checked={form.active ?? true}
            onChange={(event) => setForm((state) => ({ ...state, active: event.target.checked }))}
          />
        </div>
      </form>
    </Modal>
  )
}

function OptionsEditor({ group }: { group: ParameterGroup }) {
  const mutations = useParameterMutations()
  const toast = useToast()
  const [draft, setDraft] = useState<OptionPayload>({ code: '', label: '', colorHex: '' })

  async function addOption(event: React.FormEvent) {
    event.preventDefault()
    try {
      await mutations.createOption.mutateAsync({
        code: group.code,
        payload: { ...draft, colorHex: draft.colorHex || null, sortOrder: 100 },
      })
      setDraft({ code: '', label: '', colorHex: '' })
      toast.success('Opción agregada')
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : 'No pudimos agregar la opción')
    }
  }

  async function removeOption(optionId: number) {
    try {
      await mutations.deleteOption.mutateAsync({ code: group.code, optionId })
      toast.success('Opción eliminada')
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : 'No pudimos eliminar la opción')
    }
  }

  return (
    <div className="bg-surface-sunken border-t border-surface p-5">
      {group.options.length === 0 ? (
        <p className="text-muted mb-4 text-sm">Este grupo todavía no tiene opciones.</p>
      ) : (
        <ul className="mb-4 flex flex-wrap gap-2">
          {group.options.map((option) => (
            <li
              key={option.id}
              className="bg-surface-raised flex items-center gap-2 rounded-xl border border-surface px-3 py-1.5"
            >
              {option.colorHex ? (
                <span
                  aria-hidden
                  className="size-3.5 rounded-full border border-black/15"
                  style={{ backgroundColor: option.colorHex }}
                />
              ) : null}
              <span className="text-strong text-sm font-medium">{option.label}</span>
              <code className="text-muted text-xs">{option.code}</code>
              <button
                type="button"
                onClick={() => void removeOption(option.id)}
                aria-label={`Eliminar ${option.label}`}
                className="text-muted rounded p-0.5 transition-colors hover:text-red-600"
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={addOption} className="flex flex-wrap items-end gap-2.5">
        <TextField
          wrapperClassName="flex-1 min-w-32"
          label="Código"
          required
          placeholder="DIESEL"
          value={draft.code}
          onChange={(event) =>
            setDraft((state) => ({ ...state, code: event.target.value.toUpperCase() }))
          }
        />
        <TextField
          wrapperClassName="flex-1 min-w-32"
          label="Etiqueta"
          required
          placeholder="Diésel"
          value={draft.label}
          onChange={(event) => setDraft((state) => ({ ...state, label: event.target.value }))}
        />
        <TextField
          wrapperClassName="w-28"
          label="Color"
          placeholder="#2563eb"
          value={draft.colorHex ?? ''}
          onChange={(event) => setDraft((state) => ({ ...state, colorHex: event.target.value }))}
        />
        <Button type="submit" loading={mutations.createOption.isPending}>
          Agregar
        </Button>
      </form>
    </div>
  )
}

/* ── Marcas y modelos ───────────────────────────────────────────────────── */

function BrandsTab() {
  const { data: brands, isPending, isError, error, refetch } = useAdminBrands()
  const { data: groups } = useParameterGroups()
  const mutations = useBrandMutations()
  const toast = useToast()
  const [newBrand, setNewBrand] = useState({ name: '', countryOfOrigin: '' })
  const [expanded, setExpanded] = useState<number | null>(null)

  const bodyTypes = groups?.find((group) => group.code === 'BODY_TYPE')?.options ?? []

  async function createBrand(event: React.FormEvent) {
    event.preventDefault()
    try {
      await mutations.createBrand.mutateAsync({
        name: newBrand.name,
        countryOfOrigin: newBrand.countryOfOrigin || null,
        active: true,
      })
      setNewBrand({ name: '', countryOfOrigin: '' })
      toast.success('Marca creada')
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : 'No pudimos crear la marca')
    }
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }
  if (isPending) {
    return <Skeleton className="h-72 w-full rounded-panel" />
  }

  return (
    <>
      <form
        onSubmit={createBrand}
        className="surface-card mb-5 flex flex-wrap items-end gap-2.5 rounded-panel p-5"
      >
        <TextField
          wrapperClassName="flex-1 min-w-40"
          label="Nueva marca"
          required
          placeholder="Nissan"
          value={newBrand.name}
          onChange={(event) => setNewBrand((state) => ({ ...state, name: event.target.value }))}
        />
        <TextField
          wrapperClassName="flex-1 min-w-40"
          label="País de origen"
          placeholder="Japón"
          value={newBrand.countryOfOrigin}
          onChange={(event) =>
            setNewBrand((state) => ({ ...state, countryOfOrigin: event.target.value }))
          }
        />
        <Button type="submit" icon={<Plus className="size-4" />} loading={mutations.createBrand.isPending}>
          Agregar marca
        </Button>
      </form>

      <ul className="flex flex-col gap-3">
        {brands.map((brand) => (
          <BrandRow
            key={brand.id}
            brand={brand}
            bodyTypes={bodyTypes}
            expanded={expanded === brand.id}
            onToggle={() => setExpanded(expanded === brand.id ? null : brand.id)}
          />
        ))}
      </ul>
    </>
  )
}

function BrandRow({
  brand,
  bodyTypes,
  expanded,
  onToggle,
}: {
  brand: Brand
  bodyTypes: { code: string; label: string }[]
  expanded: boolean
  onToggle: () => void
}) {
  const mutations = useBrandMutations()
  const toast = useToast()
  const [model, setModel] = useState({ name: '', bodyTypeCode: '' })

  async function addModel(event: React.FormEvent) {
    event.preventDefault()
    try {
      await mutations.createModel.mutateAsync({
        brandId: brand.id,
        payload: { name: model.name, bodyTypeCode: model.bodyTypeCode || null, active: true },
      })
      setModel({ name: '', bodyTypeCode: '' })
      toast.success('Modelo agregado')
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : 'No pudimos agregar el modelo')
    }
  }

  async function deleteBrand() {
    if (!window.confirm(`¿Eliminar ${brand.name} y sus ${brand.modelCount} modelos?`)) {
      return
    }
    try {
      await mutations.deleteBrand.mutateAsync(brand.id)
      toast.success('Marca eliminada')
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : 'No pudimos eliminar la marca')
    }
  }

  return (
    <li className="surface-card overflow-hidden rounded-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            {brand.name}
            {!brand.active ? <Badge tone="neutral">Inactiva</Badge> : null}
          </h3>
          <p className="text-muted mt-0.5 text-sm">
            {brand.countryOfOrigin ?? 'Origen sin definir'} · {brand.modelCount} modelos
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            icon={<ChevronDown className={cn('size-3.5 transition-transform', expanded && 'rotate-180')} />}
            onClick={onToggle}
          >
            Modelos
          </Button>
          <Button size="sm" variant="ghost" icon={<Trash2 className="size-3.5" />} onClick={() => void deleteBrand()}>
            <span className="sr-only">Eliminar marca</span>
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="bg-surface-sunken border-t border-surface p-5">
          {brand.models.length > 0 ? (
            <ul className="mb-4 flex flex-wrap gap-2">
              {brand.models.map((item) => (
                <li
                  key={item.id}
                  className="bg-surface-raised flex items-center gap-2 rounded-xl border border-surface px-3 py-1.5"
                >
                  <span className="text-strong text-sm font-medium">{item.name}</span>
                  {item.bodyTypeCode ? (
                    <code className="text-muted text-xs">{item.bodyTypeCode}</code>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void mutations.deleteModel.mutateAsync(item.id)}
                    aria-label={`Eliminar ${item.name}`}
                    className="text-muted rounded p-0.5 transition-colors hover:text-red-600"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mb-4 text-sm">Esta marca todavía no tiene modelos.</p>
          )}

          <form onSubmit={addModel} className="flex flex-wrap items-end gap-2.5">
            <TextField
              wrapperClassName="flex-1 min-w-36"
              label="Nuevo modelo"
              required
              placeholder="Versa"
              value={model.name}
              onChange={(event) => setModel((state) => ({ ...state, name: event.target.value }))}
            />
            <SelectField
              wrapperClassName="flex-1 min-w-36"
              label="Carrocería"
              value={model.bodyTypeCode}
              onChange={(event) =>
                setModel((state) => ({ ...state, bodyTypeCode: event.target.value }))
              }
            >
              <option value="">Sin definir</option>
              {bodyTypes.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <Button type="submit" loading={mutations.createModel.isPending}>
              Agregar
            </Button>
          </form>
        </div>
      ) : null}
    </li>
  )
}

/* ── Noticias ───────────────────────────────────────────────────────────── */

const ARTICLE_BADGE = {
  DRAFT: { tone: 'neutral', label: 'Borrador' },
  PUBLISHED: { tone: 'success', label: 'Publicada' },
  ARCHIVED: { tone: 'neutral', label: 'Archivada' },
} as const

function NewsTab() {
  const { data, isPending, isError, error, refetch } = useAdminNews({})
  const mutations = useArticleMutations()
  const { data: groups } = useParameterGroups()
  const toast = useToast()
  const [composing, setComposing] = useState(false)

  const categories = groups?.find((group) => group.code === 'NEWS_CATEGORY')?.options ?? []

  async function changeStatus(id: number, status: ArticleStatus) {
    try {
      await mutations.changeStatus.mutateAsync({ id, status })
      toast.success(status === 'PUBLISHED' ? 'Nota publicada' : 'Nota actualizada')
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : 'No pudimos actualizar la nota')
    }
  }

  async function remove(id: number, title: string) {
    if (!window.confirm(`¿Eliminar "${title}"?`)) {
      return
    }
    try {
      await mutations.remove.mutateAsync(id)
      toast.success('Nota eliminada')
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : 'No pudimos eliminar la nota')
    }
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }
  if (isPending) {
    return <Skeleton className="h-72 w-full rounded-panel" />
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-muted text-sm">{data.totalElements} notas en total</p>
        <Button icon={<Plus className="size-4" />} onClick={() => setComposing(true)}>
          Nueva nota
        </Button>
      </div>

      {data.content.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="size-5" aria-hidden />}
          title="No hay notas todavía"
          description="Escribe la primera para alimentar la sección informativa del portal."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {data.content.map((article) => {
            const badge = ARTICLE_BADGE[article.status]
            return (
              <li
                key={article.id}
                className="surface-card flex flex-wrap items-center justify-between gap-3 rounded-panel p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={badge.tone}>{badge.label}</Badge>
                    {article.featured ? <Badge tone="brand">Destacada</Badge> : null}
                    {article.categoryCode ? (
                      <code className="text-muted text-xs">{article.categoryCode}</code>
                    ) : null}
                  </div>
                  <h3 className="mt-1.5 truncate text-base font-semibold">{article.title}</h3>
                  <p className="text-muted mt-0.5 text-xs">
                    {formatDateShort(article.publishedAt)} · {article.readingMinutes} min ·{' '}
                    {article.viewCount} vistas
                  </p>
                </div>

                <div className="flex shrink-0 gap-1.5">
                  {article.status !== 'PUBLISHED' ? (
                    <Button
                      size="sm"
                      icon={<Upload className="size-3.5" />}
                      onClick={() => void changeStatus(article.id, 'PUBLISHED')}
                    >
                      Publicar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void changeStatus(article.id, 'ARCHIVED')}
                    >
                      Archivar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Trash2 className="size-3.5" />}
                    onClick={() => void remove(article.id, article.title)}
                  >
                    <span className="sr-only">Eliminar nota</span>
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {composing ? (
        <ArticleComposer categories={categories} onClose={() => setComposing(false)} />
      ) : null}
    </>
  )
}

function ArticleComposer({
  categories,
  onClose,
}: {
  categories: { code: string; label: string }[]
  onClose: () => void
}) {
  const mutations = useArticleMutations()
  const toast = useToast()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<SaveArticleInput>({
    title: '',
    excerpt: '',
    body: '',
    coverImageUrl: '',
    categoryCode: categories[0]?.code ?? '',
    tags: [],
    featured: false,
    publishNow: true,
  })
  const [tagsText, setTagsText] = useState('')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      await mutations.create.mutateAsync({
        ...form,
        tags: tagsText
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      })
      toast.success(form.publishNow ? 'Nota publicada' : 'Borrador guardado')
      onClose()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'No pudimos guardar la nota')
    }
  }

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title="Nueva nota editorial"
      description="Para publicar se necesitan portada y al menos 200 caracteres de cuerpo."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="article-form" type="submit" loading={mutations.create.isPending}>
            Guardar
          </Button>
        </>
      }
    >
      <form id="article-form" onSubmit={submit} className="flex flex-col gap-4">
        {error ? <InlineAlert>{error}</InlineAlert> : null}

        <TextField
          label="Título"
          required
          maxLength={200}
          value={form.title}
          onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))}
        />

        <TextAreaField
          label="Resumen"
          rows={2}
          maxLength={500}
          hint="Aparece en la tarjeta del feed"
          value={form.excerpt ?? ''}
          onChange={(event) => setForm((state) => ({ ...state, excerpt: event.target.value }))}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Categoría"
            hint="Opciones del grupo NEWS_CATEGORY"
            value={form.categoryCode ?? ''}
            onChange={(event) =>
              setForm((state) => ({ ...state, categoryCode: event.target.value }))
            }
          >
            <option value="">Sin categoría</option>
            {categories.map((category) => (
              <option key={category.code} value={category.code}>
                {category.label}
              </option>
            ))}
          </SelectField>

          <TextField
            label="Etiquetas"
            hint="Separadas por coma, máximo 8"
            placeholder="electricos, mercado"
            value={tagsText}
            onChange={(event) => setTagsText(event.target.value)}
          />
        </div>

        <TextField
          label="Imagen de portada"
          type="url"
          required
          placeholder="https://…"
          value={form.coverImageUrl ?? ''}
          onChange={(event) =>
            setForm((state) => ({ ...state, coverImageUrl: event.target.value }))
          }
        />

        <TextAreaField
          label="Cuerpo"
          rows={10}
          required
          maxLength={20000}
          hint={`${form.body.length} de 200 caracteres mínimos. Separa párrafos con una línea en blanco.`}
          value={form.body}
          onChange={(event) => setForm((state) => ({ ...state, body: event.target.value }))}
        />

        <div className="flex flex-col gap-3">
          <CheckboxField
            label="Destacar en la portada"
            checked={form.featured}
            onChange={(event) => setForm((state) => ({ ...state, featured: event.target.checked }))}
          />
          <CheckboxField
            label="Publicar ahora"
            hint="Si lo desmarcas queda como borrador"
            checked={form.publishNow}
            onChange={(event) =>
              setForm((state) => ({ ...state, publishNow: event.target.checked }))
            }
          />
        </div>
      </form>
    </Modal>
  )
}
