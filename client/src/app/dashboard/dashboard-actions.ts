'use server'

export async function dashboardActionCreate({ name }: { name: string }) {
  const result = `Hello, ${name}`

  console.log(`dashboardActionCreate: ${result}`)

  return result
}
