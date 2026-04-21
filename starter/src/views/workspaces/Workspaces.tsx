import { useCallback, useEffect, useMemo, useState } from 'react'

import { useSessionUser } from '@/store/authStore'
import {
    apiCreateWorkspace,
    apiJoinWorkspaceByCode,
    apiListWorkspaces,
    apiCreateWorkspaceInvite,
    apiListWorkspaceMembers,
    apiRemoveWorkspaceMember,
    apiUpdateWorkspaceSettings,
} from '@/services/WorkspacesService'
import { normalizeApiError } from '@/services/apiError'
import type { WorkspaceInvite, WorkspaceMember } from '@/@types/workspace'

const Workspaces = () => {
    const workspaces = useSessionUser((state) => state.workspaces)
    const selectedWorkspaceId = useSessionUser(
        (state) => state.session.selectedWorkspaceId,
    )
    const setWorkspaces = useSessionUser((state) => state.setWorkspaces)
    const setSelectedWorkspaceId = useSessionUser(
        (state) => state.setSelectedWorkspaceId,
    )
    const authUserId = useSessionUser((state) => state.user.id ?? state.user.userId)

    const selectedWorkspace = useMemo(() => {
        return workspaces.find((workspace) => workspace.id === selectedWorkspaceId)
    }, [selectedWorkspaceId, workspaces])

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [members, setMembers] = useState<WorkspaceMember[]>([])
    const [latestInvite, setLatestInvite] = useState<WorkspaceInvite | null>(null)

    const [createName, setCreateName] = useState('')
    const [createCurrency, setCreateCurrency] = useState('MXN')
    const [createTimezone, setCreateTimezone] = useState('America/Mexico_City')

    const [joinCode, setJoinCode] = useState('')

    const [settingsName, setSettingsName] = useState('')
    const [settingsCurrency, setSettingsCurrency] = useState('MXN')
    const [settingsTimezone, setSettingsTimezone] = useState('America/Mexico_City')

    const loadWorkspaces = useCallback(async () => {
        try {
            setLoading(true)
            const nextWorkspaces = await apiListWorkspaces()
            setWorkspaces(nextWorkspaces)
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        } finally {
            setLoading(false)
        }
    }, [setWorkspaces])

    const loadMembers = useCallback(async () => {
        if (!selectedWorkspaceId) {
            setMembers([])
            return
        }

        try {
            setLoading(true)
            const nextMembers = await apiListWorkspaceMembers(selectedWorkspaceId)
            setMembers(nextMembers)
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        } finally {
            setLoading(false)
        }
    }, [selectedWorkspaceId])

    useEffect(() => {
        void loadWorkspaces()
    }, [loadWorkspaces])

    useEffect(() => {
        setSettingsName(selectedWorkspace?.name ?? '')
        setSettingsCurrency(selectedWorkspace?.baseCurrency ?? 'MXN')
        setSettingsTimezone(selectedWorkspace?.timezone ?? 'America/Mexico_City')
        setLatestInvite(null)
        void loadMembers()
    }, [loadMembers, selectedWorkspace])

    const handleCreateWorkspace = async () => {
        try {
            setMessage('')
            const created = await apiCreateWorkspace({
                name: createName,
                baseCurrency: createCurrency,
                timezone: createTimezone,
            })
            setCreateName('')
            await loadWorkspaces()
            setSelectedWorkspaceId(created.id)
            setMessage('Workspace creado correctamente.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleJoinWorkspace = async () => {
        try {
            setMessage('')
            const result = await apiJoinWorkspaceByCode({
                code: joinCode,
            })
            setJoinCode('')
            await loadWorkspaces()
            setSelectedWorkspaceId(result.workspaceId)
            setMessage('Te uniste al workspace correctamente.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleCreateInvite = async () => {
        if (!selectedWorkspaceId) {
            return
        }

        try {
            setMessage('')
            const invite = await apiCreateWorkspaceInvite(selectedWorkspaceId)
            setLatestInvite(invite)
            setMessage('Invitación creada.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleUpdateSettings = async () => {
        if (!selectedWorkspaceId) {
            return
        }

        try {
            setMessage('')
            await apiUpdateWorkspaceSettings(selectedWorkspaceId, {
                name: settingsName,
                baseCurrency: settingsCurrency,
                timezone: settingsTimezone,
            })
            await loadWorkspaces()
            setMessage('Configuración actualizada.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleRemoveMember = async (memberUserId: string) => {
        if (!selectedWorkspaceId) {
            return
        }

        try {
            setMessage('')
            await apiRemoveWorkspaceMember(selectedWorkspaceId, memberUserId)
            await loadMembers()
            setMessage('Miembro removido.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            <h3>Workspaces</h3>

            {message ? (
                <div className="text-sm rounded border border-gray-300 p-2">{message}</div>
            ) : null}

            <div className="grid lg:grid-cols-2 gap-4">
                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Crear workspace</h5>
                    <div className="grid gap-2">
                        <input
                            className="input"
                            placeholder="Nombre"
                            value={createName}
                            onChange={(event) => setCreateName(event.target.value)}
                        />
                        <input
                            className="input"
                            placeholder="Moneda base (MXN)"
                            value={createCurrency}
                            onChange={(event) => setCreateCurrency(event.target.value)}
                        />
                        <input
                            className="input"
                            placeholder="Zona horaria"
                            value={createTimezone}
                            onChange={(event) => setCreateTimezone(event.target.value)}
                        />
                        <button
                            type="button"
                            className="button"
                            onClick={() => {
                                void handleCreateWorkspace()
                            }}
                            disabled={loading || !createName.trim()}
                        >
                            Crear
                        </button>
                    </div>
                </div>

                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Unirse por invitación</h5>
                    <div className="grid gap-2">
                        <input
                            className="input"
                            placeholder="Código de invitación"
                            value={joinCode}
                            onChange={(event) => setJoinCode(event.target.value)}
                        />
                        <button
                            type="button"
                            className="button"
                            onClick={() => {
                                void handleJoinWorkspace()
                            }}
                            disabled={loading || !joinCode.trim()}
                        >
                            Unirse
                        </button>
                    </div>
                </div>
            </div>

            <div className="border rounded p-4 bg-white dark:bg-gray-900">
                <h5 className="mb-3">Mis workspaces</h5>
                {workspaces.length === 0 ? (
                    <p className="text-sm text-gray-500">No tienes workspaces aún.</p>
                ) : (
                    <div className="overflow-auto">
                        <table className="table-default w-full">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Rol</th>
                                    <th>Moneda</th>
                                    <th>Timezone</th>
                                    <th>Miembros</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workspaces.map((workspace) => (
                                    <tr key={workspace.id}>
                                        <td>{workspace.name}</td>
                                        <td>{workspace.role}</td>
                                        <td>{workspace.baseCurrency}</td>
                                        <td>{workspace.timezone}</td>
                                        <td>{workspace.membersCount ?? '-'}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="button"
                                                onClick={() =>
                                                    setSelectedWorkspaceId(
                                                        workspace.id,
                                                    )
                                                }
                                            >
                                                {selectedWorkspaceId === workspace.id
                                                    ? 'Activo'
                                                    : 'Seleccionar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedWorkspace ? (
                <div className="grid lg:grid-cols-2 gap-4">
                    <div className="border rounded p-4 bg-white dark:bg-gray-900">
                        <h5 className="mb-3">Configuración workspace activo</h5>
                        <p className="text-xs mb-2">
                            Workspace: <strong>{selectedWorkspace.name}</strong> (
                            {selectedWorkspace.role})
                        </p>
                        <div className="grid gap-2">
                            <input
                                className="input"
                                value={settingsName}
                                onChange={(event) =>
                                    setSettingsName(event.target.value)
                                }
                            />
                            <input
                                className="input"
                                value={settingsCurrency}
                                onChange={(event) =>
                                    setSettingsCurrency(event.target.value)
                                }
                            />
                            <input
                                className="input"
                                value={settingsTimezone}
                                onChange={(event) =>
                                    setSettingsTimezone(event.target.value)
                                }
                            />
                            <button
                                type="button"
                                className="button"
                                onClick={() => {
                                    void handleUpdateSettings()
                                }}
                                disabled={
                                    loading || selectedWorkspace.role !== 'OWNER'
                                }
                            >
                                Guardar settings (owner)
                            </button>
                        </div>
                    </div>

                    <div className="border rounded p-4 bg-white dark:bg-gray-900">
                        <h5 className="mb-3">Invitación</h5>
                        <button
                            type="button"
                            className="button"
                            onClick={() => {
                                void handleCreateInvite()
                            }}
                            disabled={loading || selectedWorkspace.role !== 'OWNER'}
                        >
                            Generar código (owner)
                        </button>
                        {latestInvite ? (
                            <div className="mt-3 text-sm">
                                <p>
                                    <strong>Código:</strong> {latestInvite.code}
                                </p>
                                <p>
                                    <strong>Expira:</strong>{' '}
                                    {new Date(
                                        latestInvite.expiresAt,
                                    ).toLocaleString()}
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {selectedWorkspace ? (
                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Miembros</h5>
                    {members.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No hay miembros cargados.
                        </p>
                    ) : (
                        <div className="overflow-auto">
                            <table className="table-default w-full">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Rol</th>
                                        <th>Ingreso</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member) => (
                                        <tr key={member.userId}>
                                            <td>{member.displayName}</td>
                                            <td>{member.email}</td>
                                            <td>{member.role}</td>
                                            <td>
                                                {new Date(
                                                    member.joinedAt,
                                                ).toLocaleString()}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="button"
                                                    onClick={() => {
                                                        void handleRemoveMember(
                                                            member.userId,
                                                        )
                                                    }}
                                                    disabled={
                                                        selectedWorkspace.role !==
                                                            'OWNER' ||
                                                        member.role === 'OWNER' ||
                                                        member.userId === authUserId
                                                    }
                                                >
                                                    Remover (owner)
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    )
}

export default Workspaces
