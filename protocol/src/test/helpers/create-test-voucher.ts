import { generateSigner, KeypairSigner, PublicKey } from '@metaplex-foundation/umi'
import { MintVoucherConfig, VoucherCondition } from '../../lib/mint-voucher'

export function createTestVoucherConfig(overrides: Partial<MintVoucherConfig> = {}): MintVoucherConfig {
  return {
    collectionAddress: '3DdcJkvjW7KLtMeko3Zr57jEJWhqRHuPsEBFm1XJYh7W' as PublicKey,
    recipient: '3DdcJkvjW7KLtMeko3Zr57jEJWhqRHuPsEBFm1XJYh7W' as PublicKey,
    voucherName: 'Test Free Coffee Voucher',
    voucherMetadataUri: 'https://arweave.net/test-voucher-metadata',
    voucherData: {
      type: 'free_item',
      value: 1,
      description: 'Free Coffee',
      expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      maxUses: 1,
      transferable: false,
      merchantId: 'test_coffee_shop_001',
    },
    updateAuthority: {} as any, // Will be replaced in tests
    ...overrides,
  }
}

export function createTestVoucherConfigEmpty(overrides: Partial<MintVoucherConfig> = {}): MintVoucherConfig {
  return {
    collectionAddress: '' as PublicKey,
    recipient: '' as PublicKey,
    voucherName: '',
    voucherMetadataUri: '',
    voucherData: {
      type: 'free_item',
      value: 0,
      description: '',
      expiryDate: 0,
      maxUses: 0,
      merchantId: '',
    },
    updateAuthority: {} as any,
    ...overrides,
  }
}

export function createTestVoucherConfigWithSigners(
  umi: any,
  overrides: Partial<MintVoucherConfig> = {},
): MintVoucherConfig {
  return createTestVoucherConfig({
    assetSigner: generateSigner(umi),
    updateAuthority: generateSigner(umi),
    ...overrides,
  })
}

// Helper functions for different voucher types
export function createPercentageOffVoucherConfig(
  umi: any,
  overrides: Partial<MintVoucherConfig> = {},
): MintVoucherConfig {
  return createTestVoucherConfigWithSigners(umi, {
    voucherName: '20% Off Voucher',
    voucherData: {
      type: 'percentage_off',
      value: 20,
      description: '20% off any purchase',
      expiryDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      maxUses: 1,
      transferable: true,
      merchantId: 'test_shop_001',
    },
    ...overrides,
  })
}

export function createFixedCreditsVoucherConfig(
  umi: any,
  overrides: Partial<MintVoucherConfig> = {},
): MintVoucherConfig {
  return createTestVoucherConfigWithSigners(umi, {
    voucherName: '100 Verxio Credits Voucher',
    voucherData: {
      type: 'fixed_verxio_credits',
      value: 100,
      description: '100 Verxio Credits',
      expiryDate: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
      maxUses: 1,
      transferable: false,
      merchantId: 'test_shop_001',
    },
    ...overrides,
  })
}

export function createBOGOVoucherConfig(umi: any, overrides: Partial<MintVoucherConfig> = {}): MintVoucherConfig {
  return createTestVoucherConfigWithSigners(umi, {
    voucherName: 'Buy One Get One Free Voucher',
    voucherData: {
      type: 'buy_one_get_one',
      value: 1,
      description: 'Buy one item, get one free',
      expiryDate: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
      maxUses: 1,
      transferable: false,
      merchantId: 'test_shop_001',
    },
    ...overrides,
  })
}

export function createVoucherWithConditions(
  umi: any,
  conditions: VoucherCondition[],
  overrides: Partial<MintVoucherConfig> = {},
): MintVoucherConfig {
  return createTestVoucherConfigWithSigners(umi, {
    voucherName: 'Conditional Voucher',
    voucherData: {
      type: 'percentage_off',
      value: 15,
      description: '15% off with conditions',
      expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      maxUses: 1,
      transferable: false,
      merchantId: 'test_shop_001',
      conditions,
    },
    ...overrides,
  })
}
