const API_BASE = import.meta.env.VITE_API_URL || '/api'
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || ''

let unauthorizedHandler = null

export class ApiClientError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.details = details
  }
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

export function getToken() {
  return localStorage.getItem('nsr_admin_token')
}

export function setToken(token) {
  localStorage.setItem('nsr_admin_token', token)
}

export function clearToken() {
  localStorage.removeItem('nsr_admin_token')
  localStorage.removeItem('nsr_admin_authenticated')
}

export function hasAuthSession() {
  return Boolean(getToken())
}

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const token = getToken()

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })
}

export async function parseResponse(res) {
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 401 && unauthorizedHandler) {
      unauthorizedHandler()
    }

    throw new ApiClientError(
      data.error || data.message || `Request failed (${res.status})`,
      res.status,
      data.details,
    )
  }

  if (data && typeof data === 'object' && data.success === true && 'data' in data) {
    return data.data
  }

  return data
}

export async function apiGet(path) {
  const res = await apiFetch(path)
  return parseResponse(res)
}

export async function apiPut(path, body) {
  const res = await apiFetch(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  return parseResponse(res)
}

export async function apiPost(path, body) {
  const res = await apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return parseResponse(res)
}

export async function apiDelete(path) {
  const res = await apiFetch(path, { method: 'DELETE' })
  return parseResponse(res)
}

export async function apiPatch(path, body) {
  const res = await apiFetch(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return parseResponse(res)
}

export async function apiUpload(file) {
  const formData = new FormData()
  formData.append('image', file)

  const res = await apiFetch('/upload', {
    method: 'POST',
    body: formData,
  })

  const data = await parseResponse(res)
  return data.url || data
}

export function resolveUploadUrl(path) {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:')) return path
  if (API_ORIGIN) return `${API_ORIGIN}${path}`
  return path
}

export { API_BASE, API_ORIGIN }
