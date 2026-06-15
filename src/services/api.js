import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '../lib/api'

export const RESOURCE_KEYS = {
  courses: 'courses',
  placements: 'placements',
  partners: 'partners',
  staff: 'staff',
  recruiter: 'testimonials_recruiter',
  video: 'testimonials_video',
}

export async function login(credentials) {
  return apiPost('/auth/login', credentials)
}

export async function fetchProfile() {
  return apiGet('/auth/me')
}

export async function fetchHealth() {
  return apiGet('/health')
}

export async function fetchStats() {
  return apiGet('/meta/stats')
}

export async function fetchResource(resourceKey) {
  const data = await apiGet(`/${resourceKey}`)
  return Array.isArray(data) ? data : []
}

export async function saveResource(resourceKey, items) {
  return apiPut(`/${resourceKey}`, items)
}

/** Save a single item — POST one row only (not the full list) */
export async function createResourceItem(resourceKey, item) {
  return apiPost(`/${resourceKey}`, item)
}

export async function updateResourceItem(resourceKey, itemId, item) {
  return apiPut(`/${resourceKey}/items/${itemId}`, item)
}

export async function deleteResourceItem(resourceKey, itemId) {
  return apiDelete(`/${resourceKey}/items/${itemId}`)
}

export async function fetchEnrollments(status = 'all') {
  const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : ''
  const data = await apiGet(`/enrollments${query}`)
  return Array.isArray(data) ? data : []
}

export async function updateEnrollmentStatus(id, status) {
  return apiPatch(`/enrollments/${id}`, { status })
}

export async function deleteEnrollment(id) {
  return apiDelete(`/enrollments/${id}`)
}
