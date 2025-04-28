export async function parseCsvFile(file: File): Promise<string[]> {
  const text = await file.text()
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export async function parseCsvFileWithActions(file: File): Promise<{ address: string; action: string }[]> {
  const text = await file.text()
  return text
    .split('\n')
    .map((line) => {
      const [address, action] = line.split(',').map((item) => item.trim())
      return { address, action }
    })
    .filter((record) => record.address && record.action)
}

export async function parseCsvFileWithPoints(
  file: File,
): Promise<{ address: string; points: number; action: string }[]> {
  const text = await file.text()
  return text
    .split('\n')
    .map((line) => {
      const [address, points, action] = line.split(',').map((item) => item.trim())
      return { address, points: parseInt(points), action: action || 'gift' }
    })
    .filter((record) => record.address && !isNaN(record.points))
}

export async function parseCsvFileWithGiftPoints(
  file: File,
): Promise<{ address: string; points: number; reason: string }[]> {
  const text = await file.text()
  return text
    .split('\n')
    .map((line) => {
      const [address, points, reason] = line.split(',').map((item) => item.trim())
      return { address, points: parseInt(points), reason: reason || 'gift' }
    })
    .filter((record) => record.address && !isNaN(record.points))
}

export const downloadResultsAsCsv = (results: any[], type: string) => {
  let csvContent = ''
  let headers = ''
  let rows = ''

  switch (type) {
    case 'issue':
      headers = 'Recipient Wallet Address,Signature\n'
      rows = results.map((r) => `${r.address},${r.signature}`).join('\n')
      break
    case 'award':
      headers = 'Pass Address,Action,Signature\n'
      rows = results.map((r) => `${r.address},${r.action},${r.signature}`).join('\n')
      break
    case 'gift':
      headers = 'Pass Address,Points,Reason,Signature\n'
      rows = results.map((r) => `${r.address},${r.points},${r.reason},${r.signature}`).join('\n')
      break
    case 'revoke':
      headers = 'Pass Address,Points,Signature\n'
      rows = results.map((r) => `${r.address},${r.points},${r.signature}`).join('\n')
      break
  }

  csvContent = headers + rows
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${type}_results_${new Date().toISOString()}.csv`
  link.click()
}
