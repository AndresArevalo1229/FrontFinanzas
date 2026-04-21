import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { Link } from 'react-router'
import { PiUserDuotone, PiSignOutDuotone } from 'react-icons/pi'
import { useAuth } from '@/auth'
import type { ChangeEvent, JSX } from 'react'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const dropdownItemList: DropdownList[] = []

const _UserDropdown = () => {
    const { avatar, userName, displayName, email } = useSessionUser(
        (state) => state.user,
    )
    const workspaces = useSessionUser((state) => state.workspaces)
    const selectedWorkspaceId = useSessionUser(
        (state) => state.session.selectedWorkspaceId,
    )
    const setSelectedWorkspaceId = useSessionUser(
        (state) => state.setSelectedWorkspaceId,
    )

    const { signOut } = useAuth()

    const handleSignOut = () => {
        void signOut()
    }

    const handleWorkspaceChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value
        setSelectedWorkspaceId(value || null)
    }

    const avatarProps = {
        ...(avatar ? { src: avatar } : { icon: <PiUserDuotone /> }),
    }

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center"
            renderTitle={
                <div className="cursor-pointer flex items-center">
                    <Avatar size={32} {...avatarProps} />
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="py-2 px-3 flex items-center gap-3">
                    <Avatar {...avatarProps} />
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                            {displayName || userName || 'Anonymous'}
                        </div>
                        <div className="text-xs">
                            {email || 'No email available'}
                        </div>
                    </div>
                </div>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            <Dropdown.Item variant="header">
                <div className="py-2 px-3 w-[260px]">
                    <div className="text-xs mb-2 text-gray-500">
                        Workspace activo
                    </div>
                    <select
                        className="input w-full"
                        value={selectedWorkspaceId ?? ''}
                        onChange={handleWorkspaceChange}
                    >
                        <option value="">Selecciona un workspace</option>
                        {workspaces.map((workspace) => (
                            <option key={workspace.id} value={workspace.id}>
                                {workspace.name} ({workspace.role})
                            </option>
                        ))}
                    </select>
                </div>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            {dropdownItemList.map((item) => (
                <Dropdown.Item
                    key={item.label}
                    eventKey={item.label}
                    className="px-0"
                >
                    <Link className="flex h-full w-full px-2" to={item.path}>
                        <span className="flex gap-2 items-center w-full">
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </span>
                    </Link>
                </Dropdown.Item>
            ))}
            <Dropdown.Item
                eventKey="Sign Out"
                className="gap-2"
                onClick={handleSignOut}
            >
                <span className="text-xl">
                    <PiSignOutDuotone />
                </span>
                <span>Sign Out</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
