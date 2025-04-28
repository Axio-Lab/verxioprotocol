'use server'

import { pinata } from '@/lib/config'
import { cache } from 'react'

export const getMetadata = cache(async (uri: string) => {
  try {
    const response = await fetch(uri)
    const metadata = await response.json()
    return metadata
  } catch (error) {
    console.error('Error in getMetadata:', error)
    throw new Error('Failed to fetch metadata')
  }
})

export const storeMetadata = cache(async (data: any) => {
  try {
    if (!data) {
      throw new Error('No metadata provided')
    }

    const { cid } = await pinata.upload.public.json(data)
    const url = await pinata.gateways.public.convert(cid)
    return url
  } catch (error) {
    console.error('Error uploading metadata:', error)
    throw new Error('Failed to store metadata')
  }
})
