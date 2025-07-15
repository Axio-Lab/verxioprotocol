import { VerxioContext } from '@schemas/verxio-context'
import { PublicKey, TransactionBuilder } from '@metaplex-foundation/umi'
import { fetchAsset } from '@metaplex-foundation/mpl-core'
import { validateVoucher, ValidateVoucherConfig, VoucherValidationResult } from '../lib/validate-voucher'

export interface ValidateVoucherInstructionConfig extends ValidateVoucherConfig {
  // No additional fields needed for validation instruction
}

export interface ValidateVoucherInstructionResult {
  validation: VoucherValidationResult
  // Note: This instruction doesn't create a transaction, it just validates
  // The result is returned directly without a TransactionBuilder
}

export async function validateVoucherInstruction(
  context: VerxioContext,
  config: ValidateVoucherInstructionConfig,
): Promise<ValidateVoucherInstructionResult> {
  assertValidValidateVoucherInstructionConfig(config)

  // Perform validation (this is a read-only operation, no transaction needed)
  const validation = await validateVoucher(context, config)

  return {
    validation,
  }
}

// TODO: Replace with zod validation
function assertValidValidateVoucherInstructionConfig(config: ValidateVoucherInstructionConfig) {
  if (!config) {
    throw new Error('assertValidValidateVoucherInstructionConfig: Config is undefined')
  }
  if (!config.voucherAddress) {
    throw new Error('assertValidValidateVoucherInstructionConfig: Voucher address is undefined')
  }
  if (!config.merchantId || !config.merchantId.trim()) {
    throw new Error('assertValidValidateVoucherInstructionConfig: Merchant ID is undefined')
  }
}
