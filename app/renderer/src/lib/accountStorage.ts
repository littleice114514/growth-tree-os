const LOCAL_USER_ID = 'local_user'
const STORAGE_PREFIX = 'growth-tree-os'

export function getCurrentLocalStorageUserId(): string {
  return LOCAL_USER_ID
}

export function accountLocalStorageKey(namespace: string, name: string): string {
  return `${STORAGE_PREFIX}:${getCurrentLocalStorageUserId()}:${namespace}:${name}:v1`
}

export function migrateLegacyLocalStorageKey(legacyKey: string, accountKey: string): void {
  if (typeof window === 'undefined') {
    return
  }

  const accountValue = window.localStorage.getItem(accountKey)
  if (accountValue !== null && accountValue !== '') {
    return
  }

  const legacyValue = window.localStorage.getItem(legacyKey)
  if (legacyValue === null || legacyValue === '') {
    return
  }

  window.localStorage.setItem(accountKey, legacyValue)
}
