import { VerxioContext } from '@schemas/verxio-context'
import { validateVoucher, ValidateVoucherConfig, VoucherValidationResult } from '../lib/validate-voucher'

export interface ValidateVoucherInstructionConfig extends ValidateVoucherConfig {
  // No additional fields needed for validation instruction
}

export interface ValidateVoucherInstructionResult {
  validation: VoucherValidationResult & { isValid: boolean }
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

  // Add isValid property for backward compatibility
  const result = {
    ...validation,
    isValid: validation.errors.length === 0 && validation.voucher !== undefined,
  }

  return {
    validation: result,
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
}
