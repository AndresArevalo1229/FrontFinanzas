export const toIsoOrUndefined = (value: string): string | undefined => {
    if (!value) {
        return undefined
    }

    return new Date(value).toISOString()
}

export const isoToDatetimeLocal = (value?: string | null): string => {
    if (!value) {
        return ''
    }

    const date = new Date(value)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
}

export const formatIso = (value?: string | null): string => {
    if (!value) {
        return 'N/A'
    }

    return new Date(value).toLocaleString()
}
