'use server'

import { pinata } from '@/lib/config'
import { cache } from 'react'

export const uploadFile = cache(async (formData: FormData) => {
  try {
    const file = formData.get('file') as File
    if (!file) {
      throw new Error('No file provided')
    }

    const { cid } = await pinata.upload.public.file(file)
    const url = await pinata.gateways.public.convert(cid)
    return { url }
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload file')
  }
})

export const deleteFile = cache(async (url: string) => {
  try {
    // Implementation for file deletion
    return { success: true }
  } catch (error) {
    console.error('Error deleting file:', error)
    throw new Error('Failed to delete file')
  }
})
