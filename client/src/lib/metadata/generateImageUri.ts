import { uploadFile } from '@/app/actions/files'

export async function generateImageUri(file: File): Promise<string> {
  try {
    if (!file) {
      throw new Error('No file provided')
    }

    const formData = new FormData()
    formData.set('file', file)

    const result = await uploadFile(formData)
    return result.url
  } catch (error) {
    console.error('Error generating image URI:', error)
    throw new Error('Failed to generate image URI')
  }
}
