import ActionLink from '@/components/shared/ActionLink'
import { useSessionUser } from '@/store/authStore'
import type { ReactNode } from 'react'

interface WorkspaceRequiredNoticeProps {
    children?: ReactNode
}

const WorkspaceRequiredNotice = ({ children }: WorkspaceRequiredNoticeProps) => {
    const selectedWorkspaceId = useSessionUser(
        (state) => state.session.selectedWorkspaceId,
    )

    if (selectedWorkspaceId) {
        return <>{children}</>
    }

    return (
        <div className="p-4 rounded border border-amber-200 bg-amber-50 text-amber-800">
            <p className="font-semibold mb-2">Debes seleccionar un workspace.</p>
            <ActionLink to="/workspaces" themeColor={false}>
                Ir a gestión de workspaces
            </ActionLink>
        </div>
    )
}

export default WorkspaceRequiredNotice
