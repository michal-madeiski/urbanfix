const AUTH_TOKEN_KEY = 'urbanfix.authToken'
const AUTH_ID_TOKEN_KEY = 'urbanfix.idToken'
const AUTH_EXPIRES_AT_KEY = 'urbanfix.authExpiresAt'
const AUTH_GROUPS_KEY = 'urbanfix.authGroups'
const AUTH_STATE_KEY = 'urbanfix.oauthState'
const AUTH_VERIFIER_KEY = 'urbanfix.oauthVerifier'
const AUTH_RETURN_PATH_KEY = 'urbanfix.oauthReturnPath'
const AUTH_MESSAGE_KEY = 'urbanfix.authMessage'

type CognitoTokenResponse = {
  access_token: string
  expires_in: number
  id_token?: string
  refresh_token?: string
  token_type: string
}

type JwtPayload = {
  'cognito:groups'?: string[]
  exp?: number
}

function getAuthConfig() {
  return {
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined,
    domain: (import.meta.env.VITE_COGNITO_DOMAIN as string | undefined)
      ?.replace(/\/$/, ''),
    logoutUri: import.meta.env.VITE_COGNITO_LOGOUT_URI as string | undefined,
    redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI as
      | string
      | undefined,
    scopes:
      (import.meta.env.VITE_COGNITO_SCOPES as string | undefined) ??
      'openid email profile',
  }
}

export function isCognitoConfigured() {
  const config = getAuthConfig()

  return Boolean(config.clientId && config.domain && config.redirectUri)
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array) {
  const byteArray = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  const binary = String.fromCharCode(...byteArray)

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function randomBase64Url(byteLength = 32) {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)

  return base64UrlEncode(bytes)
}

async function createCodeChallenge(verifier: string) {
  const encodedVerifier = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', encodedVerifier)

  return base64UrlEncode(digest)
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const [, payload] = token.split('.')

  if (!payload) {
    return null
  }

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((character) =>
          `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`,
        )
        .join(''),
    )

    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

function getStoredGroups() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_GROUPS_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function getAccessToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getAuthMessage() {
  const message = sessionStorage.getItem(AUTH_MESSAGE_KEY)
  sessionStorage.removeItem(AUTH_MESSAGE_KEY)

  return message
}

export function setAuthMessage(message: string) {
  sessionStorage.setItem(AUTH_MESSAGE_KEY, message)
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_ID_TOKEN_KEY)
  localStorage.removeItem(AUTH_EXPIRES_AT_KEY)
  localStorage.removeItem(AUTH_GROUPS_KEY)
  sessionStorage.removeItem(AUTH_STATE_KEY)
  sessionStorage.removeItem(AUTH_VERIFIER_KEY)
  sessionStorage.removeItem(AUTH_RETURN_PATH_KEY)
}

export function isAdminAuthenticated() {
  const token = getAccessToken()
  const expiresAt = Number(localStorage.getItem(AUTH_EXPIRES_AT_KEY) ?? 0)

  return Boolean(
    token &&
      expiresAt > Date.now() &&
      getStoredGroups().includes('Admin'),
  )
}

export async function beginAdminLogin(returnPath = '/admin/reports') {
  const config = getAuthConfig()

  if (!config.clientId || !config.domain || !config.redirectUri) {
    throw new Error('Brakuje konfiguracji Cognito w pliku .env frontendu.')
  }

  const state = randomBase64Url()
  const verifier = randomBase64Url(64)
  const challenge = await createCodeChallenge(verifier)
  const params = new URLSearchParams({
    client_id: config.clientId,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes,
    state,
  })

  sessionStorage.setItem(AUTH_STATE_KEY, state)
  sessionStorage.setItem(AUTH_VERIFIER_KEY, verifier)
  sessionStorage.setItem(AUTH_RETURN_PATH_KEY, returnPath)

  window.location.assign(`${config.domain}/oauth2/authorize?${params}`)
}

export async function completeAdminLogin(code: string, state: string) {
  const config = getAuthConfig()
  const expectedState = sessionStorage.getItem(AUTH_STATE_KEY)
  const verifier = sessionStorage.getItem(AUTH_VERIFIER_KEY)
  const returnPath =
    sessionStorage.getItem(AUTH_RETURN_PATH_KEY) ?? '/admin/reports'

  if (!config.clientId || !config.domain || !config.redirectUri) {
    throw new Error('Brakuje konfiguracji Cognito w pliku .env frontendu.')
  }

  if (!expectedState || expectedState !== state || !verifier) {
    throw new Error('Nieprawidłowy stan logowania. Spróbuj ponownie.')
  }

  const response = await fetch(`${config.domain}/oauth2/token`, {
    body: new URLSearchParams({
      client_id: config.clientId,
      code,
      code_verifier: verifier,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Nie udało się zakończyć logowania w Cognito.')
  }

  const tokens = (await response.json()) as CognitoTokenResponse
  const payload = decodeJwtPayload(tokens.access_token)
  const groups = payload?.['cognito:groups'] ?? []
  const expiresAt = payload?.exp
    ? payload.exp * 1000
    : Date.now() + tokens.expires_in * 1000

  localStorage.setItem(AUTH_TOKEN_KEY, tokens.access_token)
  localStorage.setItem(AUTH_EXPIRES_AT_KEY, String(expiresAt))
  localStorage.setItem(AUTH_GROUPS_KEY, JSON.stringify(groups))

  if (tokens.id_token) {
    localStorage.setItem(AUTH_ID_TOKEN_KEY, tokens.id_token)
  }

  sessionStorage.removeItem(AUTH_STATE_KEY)
  sessionStorage.removeItem(AUTH_VERIFIER_KEY)
  sessionStorage.removeItem(AUTH_RETURN_PATH_KEY)

  if (!groups.includes('Admin')) {
    clearAuthSession()
    throw new Error('Twoje konto nie ma uprawnień administratora.')
  }

  return returnPath
}

export function logoutAdmin() {
  const config = getAuthConfig()

  clearAuthSession()

  if (config.clientId && config.domain && config.logoutUri) {
    const params = new URLSearchParams({
      client_id: config.clientId,
      logout_uri: config.logoutUri,
    })

    window.location.assign(`${config.domain}/logout?${params}`)
    return
  }

  window.location.assign('/admin/login')
}
