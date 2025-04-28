import loadingAsset from '@/app/public/loadingAsset.gif'

// Simple in-memory cache
const imageCache = new Map<string, string>()

export async function getImageFromMetadata(metadataUri: string): Promise<string> {
  // Check cache first
  if (imageCache.has(metadataUri)) {
    return imageCache.get(metadataUri)!
  }

  try {
    // Fetch the metadata
    const response = await fetch(metadataUri)
    if (!response.ok) {
      return loadingAsset.src
    }

    const metadata = await response.json()
    const imageUrl = metadata.image

    if (!imageUrl) {
      return loadingAsset.src
    }

    // Cache the result
    imageCache.set(metadataUri, imageUrl)

    return imageUrl
  } catch (error) {
    // Silently handle the error and return the loading asset
    imageCache.set(metadataUri, loadingAsset.src)
    return loadingAsset.src
  }
}
