import { generateSigner, KeypairSigner, PublicKey } from '@metaplex-foundation/umi'
import { CreateVoucherCollectionConfig } from '../../lib/create-voucher-collection'

export function createTestVoucherCollectionConfig(
  overrides: Partial<CreateVoucherCollectionConfig> = {},
): CreateVoucherCollectionConfig {
  return {
    voucherCollectionName: 'Test Voucher Collection',
    metadataUri: 'https://arweave.net/test-voucher-collection-metadata',
    programAuthority: '3DdcJkvjW7KLtMeko3Zr57jEJWhqRHuPsEBFm1XJYh7W' as PublicKey,
    metadata: {
      merchantName: 'Test Coffee Shop',
      merchantAddress: 'test_coffee_shop_001',
      contactInfo: 'contact@testcoffee.com',
      voucherTypes: ['discount', 'free_item', 'credits'],
    },
    ...overrides,
  }
}

export function createTestVoucherCollectionConfigEmpty(
  overrides: Partial<CreateVoucherCollectionConfig> = {},
): CreateVoucherCollectionConfig {
  return {
    voucherCollectionName: '',
    metadataUri: '',
    programAuthority: '' as PublicKey,
    metadata: {
      merchantName: '',
      merchantAddress: '',
      voucherTypes: [],
    },
    ...overrides,
  }
}

export function createTestVoucherCollectionConfigWithSigners(
  umi: any,
  overrides: Partial<CreateVoucherCollectionConfig> = {},
): CreateVoucherCollectionConfig {
  return createTestVoucherCollectionConfig({
    collectionSigner: generateSigner(umi),
    updateAuthority: generateSigner(umi),
    ...overrides,
  })
}
