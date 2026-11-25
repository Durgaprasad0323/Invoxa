const DEV_ONLY_JWT_SECRET = 'invoxa-local-development-secret-do-not-use-in-production'

export const getJwtSecret = () => {
  const configuredSecret = process.env.JWT_SECRET?.trim()
  if (
    configuredSecret &&
    configuredSecret.length >= 32 &&
    configuredSecret !== 'invoxa_jwt_secret_dev_key_2026_super_secure' &&
    !/your_jwt_secret|change.?me|placeholder/i.test(configuredSecret)
  ) {
    return configuredSecret
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured with at least 32 non-placeholder characters in production.')
  }

  return DEV_ONLY_JWT_SECRET
}

export const validateProductionSecurityConfig = () => {
  if (process.env.NODE_ENV !== 'production') return

  getJwtSecret()
}
