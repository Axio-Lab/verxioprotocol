import { describe, expect, it } from 'vitest'
import { getTestContext } from './helpers/get-test-context'
import { VerxioContext } from '../schemas/verxio-context'
import { assertValidContext } from '../utils/assert-valid-context'

const { context } = getTestContext()

describe('verxio context', () => {
  describe('expected usage', () => {
    it('should create a verxio context', () => {
      expect(context).toBeDefined()
      expect(context.umi).toBeDefined()
      expect(context.programAuthority).toBeDefined()
      expect(context.collectionAddress).not.toBeDefined()
    })
  })
  describe('unexpected usage', () => {
    it('should throw an error if the context is undefined', async () => {
      expect.assertions(2)
      // ARRANGE
      const brokenContext = undefined as unknown as VerxioContext

      // ACT
      try {
        assertValidContext(brokenContext)
      } catch (error) {
        // ASSERT
        expect(error).toBeDefined()
        expect(error.message).toEqual('assertValidContext: Context is undefined')
      }
    })

    it('should throw an error if the program authority is undefined', async () => {
      expect.assertions(2)
      // ARRANGE
      const brokenContext: VerxioContext = { ...context, programAuthority: undefined } as VerxioContext

      // ACT
      try {
        assertValidContext(brokenContext)
      } catch (error) {
        // ASSERT
        expect(error).toBeDefined()
        expect(error.message).toEqual('assertValidContext: Program authority is undefined')
      }
    })

    it('should throw an error if the UMI is undefined', async () => {
      expect.assertions(2)
      // ARRANGE
      const brokenContext: VerxioContext = { ...context, umi: undefined } as VerxioContext

      // ACT
      try {
        assertValidContext(brokenContext)
      } catch (error) {
        // ASSERT
        expect(error).toBeDefined()
        expect(error.message).toEqual('assertValidContext: UMI is undefined')
      }
    })
  })
})
