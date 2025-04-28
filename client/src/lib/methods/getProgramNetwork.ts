import prisma from '@/lib/prisma'

export async function getProgramNetwork(programId: string): Promise<string | null> {
  try {
    const program = await prisma.loyaltyProgram.findFirst({
      where: {
        publicKey: programId,
      },
      select: {
        network: true,
      },
    })

    return program?.network || null
  } catch (error) {
    console.error('Error fetching program network:', error)
    return null
  }
}
