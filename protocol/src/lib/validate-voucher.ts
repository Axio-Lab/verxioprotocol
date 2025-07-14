import { VerxioContext } from '@schemas/verxio-context'
import { PublicKey } from '@metaplex-foundation/umi'
import { fetchAsset } from '@metaplex-foundation/mpl-core'
import { VoucherData, VoucherCondition } from './mint-voucher'

export interface ValidateVoucherConfig {
  voucherAddress: PublicKey
  merchantId: string
  redemptionContext?: {
    purchaseAmount?: number
    items?: string[]
    userTier?: string
    timestamp?: number
  }
}

export interface VoucherValidationResult {
  isValid: boolean
  voucher?: VoucherData
  errors: string[]
  warnings: string[]
}

export async function validateVoucher(
  context: VerxioContext,
  config: ValidateVoucherConfig,
): Promise<VoucherValidationResult> {
  const result: VoucherValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
  }

  try {
    // Fetch the voucher asset
    const asset = await fetchAsset(context.umi, config.voucherAddress)

    // Extract voucher data from AppData (new structure)
    const appData = (asset as any).appDatas?.[0]
    if (!appData || !appData.data) {
      result.errors.push('Voucher data not found')
      return result
    }

    const voucherData: VoucherData = appData.data
    result.voucher = voucherData

    // Basic validation checks
    const validationChecks = [
      () => validateVoucherStatus(voucherData),
      () => validateMerchant(voucherData, config.merchantId),
      () => validateExpiry(voucherData),
      () => validateUsageLimit(voucherData),
      () => validateConditions(voucherData, config.redemptionContext),
    ]

    for (const check of validationChecks) {
      const checkResult = check()
      if (checkResult.errors.length > 0) {
        result.errors.push(...checkResult.errors)
      }
      if (checkResult.warnings.length > 0) {
        result.warnings.push(...checkResult.warnings)
      }
    }

    result.isValid = result.errors.length === 0

    return result
  } catch (error) {
    result.errors.push(`Failed to validate voucher: ${error}`)
    return result
  }
}

function validateVoucherStatus(voucher: VoucherData): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (voucher.status !== 'active') {
    errors.push(`Voucher is ${voucher.status}`)
  }

  return { errors, warnings }
}

function validateMerchant(voucher: VoucherData, merchantId: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (voucher.merchantId !== merchantId) {
    errors.push(`Voucher is not valid for merchant ${merchantId}`)
  }

  return { errors, warnings }
}

function validateExpiry(voucher: VoucherData): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  const now = Date.now()

  if (voucher.expiryDate <= now) {
    errors.push('Voucher has expired')
  } else if (voucher.expiryDate - now < 24 * 60 * 60 * 1000) {
    // 24 hours
    warnings.push('Voucher expires within 24 hours')
  }

  return { errors, warnings }
}

function validateUsageLimit(voucher: VoucherData): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (voucher.currentUses >= voucher.maxUses) {
    errors.push('Voucher has reached maximum usage limit')
  }

  return { errors, warnings }
}

function validateConditions(
  voucher: VoucherData,
  redemptionContext?: ValidateVoucherConfig['redemptionContext'],
): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (!voucher.conditions || voucher.conditions.length === 0) {
    return { errors, warnings }
  }

  if (!redemptionContext) {
    errors.push('Redemption context required for conditional voucher')
    return { errors, warnings }
  }

  for (const condition of voucher.conditions) {
    const conditionResult = validateSingleCondition(condition, redemptionContext)
    if (!conditionResult.isValid) {
      errors.push(conditionResult.error)
    }
  }

  return { errors, warnings }
}

function validateSingleCondition(
  condition: VoucherCondition,
  context: ValidateVoucherConfig['redemptionContext'],
): { isValid: boolean; error: string } {
  switch (condition.type) {
    case 'minimum_purchase':
      return validateMinimumPurchase(condition, context?.purchaseAmount)
    case 'specific_items':
      return validateSpecificItems(condition, context?.items)
    case 'time_restriction':
      return validateTimeRestriction(condition, context?.timestamp)
    case 'user_tier':
      return validateUserTier(condition, context?.userTier)
    default:
      return { isValid: false, error: `Unknown condition type: ${condition.type}` }
  }
}

function validateMinimumPurchase(
  condition: VoucherCondition,
  purchaseAmount?: number,
): { isValid: boolean; error: string } {
  if (purchaseAmount === undefined) {
    return { isValid: false, error: 'Purchase amount required for minimum purchase condition' }
  }

  const minAmount = condition.value
  const isValid = condition.operator === 'greater_than' ? purchaseAmount > minAmount : purchaseAmount >= minAmount

  return {
    isValid,
    error: isValid ? '' : `Minimum purchase amount of ${minAmount} required`,
  }
}

function validateSpecificItems(condition: VoucherCondition, items?: string[]): { isValid: boolean; error: string } {
  if (!items || items.length === 0) {
    return { isValid: false, error: 'Items required for specific items condition' }
  }

  const requiredItems = Array.isArray(condition.value) ? condition.value : [condition.value]
  const hasRequiredItems =
    condition.operator === 'contains'
      ? requiredItems.some((item) => items.includes(item))
      : requiredItems.every((item) => items.includes(item))

  return {
    isValid: hasRequiredItems,
    error: hasRequiredItems ? '' : `Required items not found: ${requiredItems.join(', ')}`,
  }
}

function validateTimeRestriction(condition: VoucherCondition, timestamp?: number): { isValid: boolean; error: string } {
  const now = timestamp || Date.now()
  const restrictionTime = condition.value

  let isValid = false
  switch (condition.operator) {
    case 'greater_than':
      isValid = now > restrictionTime
      break
    case 'less_than':
      isValid = now < restrictionTime
      break
    case 'equals':
      // For time equality, we'll use a 1-hour window
      isValid = Math.abs(now - restrictionTime) < 60 * 60 * 1000
      break
    default:
      return { isValid: false, error: `Invalid time restriction operator: ${condition.operator}` }
  }

  return {
    isValid,
    error: isValid ? '' : 'Time restriction not met',
  }
}

function validateUserTier(condition: VoucherCondition, userTier?: string): { isValid: boolean; error: string } {
  if (!userTier) {
    return { isValid: false, error: 'User tier required for tier condition' }
  }

  const requiredTier = condition.value
  const isValid = condition.operator === 'equals' ? userTier === requiredTier : userTier.includes(requiredTier)

  return {
    isValid,
    error: isValid ? '' : `Required tier: ${requiredTier}`,
  }
}
