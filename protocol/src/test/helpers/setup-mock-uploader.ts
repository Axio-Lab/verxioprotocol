import { vi } from 'vitest'
import { createMockUploader, createMockUmiUploader } from './mock-uploader'

// Mock the metadata generation module
export function setupMockUploader() {
  const mockUploader = createMockUploader()
  const mockUmiUploader = createMockUmiUploader()

  // Mock the uploadImage function
  vi.doMock('../lib/metadata/generate-nft-metadata', () => ({
    uploadImage: vi.fn().mockImplementation(mockUploader.uploadImage),
    generateLoyaltyProgramMetadata: vi.fn().mockImplementation(mockUploader.generateLoyaltyProgramMetadata),
    generateLoyaltyPassMetadata: vi.fn().mockImplementation(mockUploader.generateLoyaltyPassMetadata),
    generateVoucherCollectionMetadata: vi.fn().mockImplementation(mockUploader.generateVoucherCollectionMetadata),
    generateVoucherMetadata: vi.fn().mockImplementation(mockUploader.generateVoucherMetadata),
  }))

  // Mock the UMI uploader
  vi.doMock('@metaplex-foundation/umi', async () => {
    const actual = await vi.importActual('@metaplex-foundation/umi')
    return {
      ...actual,
      createUmi: vi.fn().mockImplementation((config: any) => ({
        ...config,
        uploader: mockUmiUploader,
      })),
    }
  })

  return { mockUploader, mockUmiUploader }
}

// Setup function to be called in test files
export function setupTestEnvironment() {
  // Mock the uploader before any tests run
  setupMockUploader()

  // Temporarily disable console mocking to see error logs
  // vi.spyOn(console, 'error').mockImplementation(() => {})
  // vi.spyOn(console, 'log').mockImplementation(() => {})
}

// Cleanup function to be called after tests
export function cleanupTestEnvironment() {
  vi.restoreAllMocks()
}

// Automatically set up mocks when this file is loaded
setupTestEnvironment()
