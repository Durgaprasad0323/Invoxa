import { UserModel } from '../models/User.js'
import { db } from '../config/db.js'

export const PRO_TRIAL_DAYS = 7
export const PRO_TRIAL_CREATION_LIMIT = 3
const DAY_MS = 86400000
const planRanks = { free: 0, pro: 1, enterprise: 2 }

const hasActivePaidPlan = (user, now = Date.now()) => {
  if (user?.role === 'super_admin') return true
  const rank = planRanks[user?.plan] || 0
  if (rank < 1) return false
  const expiry = user?.subscriptionExpiry ? new Date(user.subscriptionExpiry).getTime() : 0
  return Number.isFinite(expiry) && expiry > now
}

const isEligibleForTrial = user => (
  user?.role !== 'super_admin' &&
  (user?.plan || 'free') === 'free' &&
  !(user?.subscriptionPayments || []).length
)

export const getProTrialStatus = (user, now = Date.now()) => {
  const startedAt = user?.proTrialStartedAt || null
  const endsAt = user?.proTrialEndsAt || null
  const startedMs = startedAt ? new Date(startedAt).getTime() : 0
  const endsMs = endsAt ? new Date(endsAt).getTime() : 0
  const creationsUsed = Math.max(0, Number(user?.proTrialCreationsUsed) || 0)
  const eligible = isEligibleForTrial(user)
  const active = eligible && startedMs > 0 && endsMs > now && creationsUsed < PRO_TRIAL_CREATION_LIMIT

  return {
    started: startedMs > 0,
    canStart: eligible && startedMs === 0,
    active,
    startedAt,
    endsAt,
    creationsUsed,
    creationLimit: PRO_TRIAL_CREATION_LIMIT,
    creationsRemaining: Math.max(0, PRO_TRIAL_CREATION_LIMIT - creationsUsed),
    daysRemaining: active ? Math.max(1, Math.ceil((endsMs - now) / DAY_MS)) : 0,
    limitReached: creationsUsed >= PRO_TRIAL_CREATION_LIMIT,
    timeExpired: startedMs > 0 && endsMs <= now
  }
}

const persistTrial = async user => {
  if (db.isMongoConnected) {
    await UserModel.updateOne({ id: user.id }, {
      $set: {
        proTrialStartedAt: user.proTrialStartedAt || null,
        proTrialEndsAt: user.proTrialEndsAt || null,
        proTrialCreationsUsed: user.proTrialCreationsUsed || 0,
        proTrialUsage: user.proTrialUsage || []
      }
    })
  }
  if (!db.saveLocal()) throw new Error('Could not save the Pro trial state.')
}

export const startProTrial = async user => {
  if (!user) throw new Error('User not found.')
  if (user.proTrialStartedAt) return getProTrialStatus(user)
  if (!isEligibleForTrial(user)) return getProTrialStatus(user)

  const now = Date.now()
  user.proTrialStartedAt = new Date(now).toISOString()
  user.proTrialEndsAt = new Date(now + PRO_TRIAL_DAYS * DAY_MS).toISOString()
  user.proTrialCreationsUsed = 0
  user.proTrialUsage ||= []
  await persistTrial(user)
  return getProTrialStatus(user)
}

export const consumeProTrialCreation = async (user, { usageId, feature }) => {
  if (!user) throw new Error('User not found.')
  if (hasActivePaidPlan(user)) return { consumed: false, trial: getProTrialStatus(user) }

  const status = getProTrialStatus(user)
  if (!status.active) {
    const error = new Error('Your free Pro trial has ended. Subscribe to continue creating Pro documents.')
    error.status = 403
    error.code = 'PRO_TRIAL_EXHAUSTED'
    error.trial = status
    throw error
  }

  user.proTrialUsage ||= []
  if (user.proTrialUsage.some(entry => entry.usageId === usageId)) {
    return { consumed: false, trial: getProTrialStatus(user) }
  }

  user.proTrialCreationsUsed = status.creationsUsed + 1
  user.proTrialUsage.push({
    usageId,
    feature: String(feature || 'Pro document').slice(0, 60),
    usedAt: new Date().toISOString()
  })
  await persistTrial(user)
  return { consumed: true, trial: getProTrialStatus(user) }
}

export const refundProTrialCreation = async (userId, usageId) => {
  const user = db.data.users.find(entry => entry.id === userId)
  if (!user) return
  const usage = user.proTrialUsage || []
  const index = usage.findIndex(entry => entry.usageId === usageId)
  if (index < 0) return
  usage.splice(index, 1)
  user.proTrialCreationsUsed = Math.max(0, (Number(user.proTrialCreationsUsed) || 0) - 1)
  await persistTrial(user)
}
