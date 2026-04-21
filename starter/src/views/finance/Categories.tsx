import { useCallback, useEffect, useState } from 'react'

import WorkspaceRequiredNotice from '@/components/app/WorkspaceRequiredNotice'
import { useSessionUser } from '@/store/authStore'
import {
    apiCreateCategory,
    apiDeleteCategory,
    apiListCategories,
    apiUpdateCategory,
} from '@/services/FinanceService'
import { normalizeApiError } from '@/services/apiError'
import type { Category, TransactionType } from '@/@types/finance'

const transactionTypes: TransactionType[] = ['INCOME', 'EXPENSE']

const Categories = () => {
    const selectedWorkspaceId = useSessionUser(
        (state) => state.session.selectedWorkspaceId,
    )

    const [items, setItems] = useState<Category[]>([])
    const [name, setName] = useState('')
    const [type, setType] = useState<TransactionType>('EXPENSE')
    const [color, setColor] = useState('')
    const [icon, setIcon] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const loadData = useCallback(async () => {
        if (!selectedWorkspaceId) {
            setItems([])
            return
        }

        try {
            setLoading(true)
            const categories = await apiListCategories()
            setItems(categories)
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        } finally {
            setLoading(false)
        }
    }, [selectedWorkspaceId])

    useEffect(() => {
        void loadData()
    }, [loadData])

    const handleCreate = async () => {
        try {
            setMessage('')
            await apiCreateCategory({
                name,
                type,
                color: color || undefined,
                icon: icon || undefined,
            })
            setName('')
            setColor('')
            setIcon('')
            await loadData()
            setMessage('Categoría creada.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleEdit = async (category: Category) => {
        const nextName = window.prompt('Nuevo nombre', category.name)
        if (!nextName) {
            return
        }

        try {
            await apiUpdateCategory(category.id, {
                name: nextName,
            })
            await loadData()
            setMessage('Categoría actualizada.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleDelete = async (category: Category) => {
        try {
            await apiDeleteCategory(category.id)
            await loadData()
            setMessage('Categoría eliminada.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            <h3>Categorías</h3>

            {message ? (
                <div className="text-sm rounded border border-gray-300 p-2">{message}</div>
            ) : null}

            <WorkspaceRequiredNotice>
                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Crear categoría</h5>
                    <div className="grid md:grid-cols-5 gap-2">
                        <input
                            className="input"
                            placeholder="Nombre"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                        <select
                            className="input"
                            value={type}
                            onChange={(event) =>
                                setType(event.target.value as TransactionType)
                            }
                        >
                            {transactionTypes.map((transactionType) => (
                                <option key={transactionType} value={transactionType}>
                                    {transactionType}
                                </option>
                            ))}
                        </select>
                        <input
                            className="input"
                            placeholder="Color (opcional)"
                            value={color}
                            onChange={(event) => setColor(event.target.value)}
                        />
                        <input
                            className="input"
                            placeholder="Icono (opcional)"
                            value={icon}
                            onChange={(event) => setIcon(event.target.value)}
                        />
                        <button
                            type="button"
                            className="button"
                            onClick={() => {
                                void handleCreate()
                            }}
                            disabled={loading || !name.trim()}
                        >
                            Crear
                        </button>
                    </div>
                </div>

                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Listado</h5>
                    {items.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No hay categorías registradas.
                        </p>
                    ) : (
                        <div className="overflow-auto">
                            <table className="table-default w-full">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Tipo</th>
                                        <th>Sistema</th>
                                        <th>Color</th>
                                        <th>Icono</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((category) => (
                                        <tr key={category.id}>
                                            <td>{category.name}</td>
                                            <td>{category.type}</td>
                                            <td>{category.isSystem ? 'Sí' : 'No'}</td>
                                            <td>{category.color ?? '-'}</td>
                                            <td>{category.icon ?? '-'}</td>
                                            <td className="flex gap-2">
                                                <button
                                                    type="button"
                                                    className="button"
                                                    onClick={() => {
                                                        void handleEdit(category)
                                                    }}
                                                    disabled={category.isSystem}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="button"
                                                    onClick={() => {
                                                        void handleDelete(category)
                                                    }}
                                                    disabled={category.isSystem}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </WorkspaceRequiredNotice>
        </div>
    )
}

export default Categories
