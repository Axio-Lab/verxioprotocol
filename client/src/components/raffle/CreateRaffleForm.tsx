import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  prizeType: z.enum(['TOKEN', 'MERCH', 'NFT', 'OTHER']),
  prizeDetails: z.object({
    token: z
      .object({
        amount: z.number(),
        mint: z.string(),
      })
      .optional(),
    merch: z
      .object({
        description: z.string(),
        shippingInfo: z.string(),
      })
      .optional(),
    nft: z
      .object({
        collection: z.string(),
        name: z.string(),
      })
      .optional(),
    other: z
      .object({
        description: z.string(),
      })
      .optional(),
  }),
  programAddress: z.string().min(1, 'Program address is required'),
  startDate: z.date(),
  endDate: z.date(),
  drawDate: z.date(),
  entryCost: z.number().optional(),
  minTier: z.string().optional(),
  numWinners: z.number().min(1, 'At least one winner is required'),
})

interface CreateRaffleFormProps {
  programs: Array<{
    id: string
    name: string
    publicKey: string
  }>
}

export function CreateRaffleForm({ programs }: CreateRaffleFormProps) {
  const { publicKey } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [errorShown, setErrorShown] = useState(false)
  const [activeTab, setActiveTab] = useState('basics')
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      prizeType: 'TOKEN',
      prizeDetails: {
        token: {
          amount: 0,
          mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mint
        },
      },
      numWinners: 1,
      entryCost: 0,
      startDate: undefined,
      endDate: undefined,
      drawDate: undefined,
      minTier: '',
      programAddress: '',
    },
    mode: 'onChange',
  })

  const prizeType = form.watch('prizeType')
  const formValues = form.watch()
  const isFormValid =
    formValues.name &&
    formValues.description &&
    formValues.programAddress &&
    formValues.numWinners > 0 &&
    formValues.startDate &&
    formValues.endDate &&
    formValues.drawDate &&
    (prizeType !== 'TOKEN' || (formValues.prizeDetails?.token?.amount && formValues.prizeDetails?.token?.mint))

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let isMounted = true
    try {
      setIsLoading(true)

      if (!publicKey) {
        throw new Error('Wallet not connected')
      }

      // Format the data before sending
      const formattedData = {
        ...values,
        status: 'UPCOMING' as const,
        creator: publicKey.toString(),
        programAddress: values.programAddress,
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
        drawDate: new Date(values.drawDate),
        prizeDetails: values.prizeDetails,
      }

      console.log('Submitting raffle data:', formattedData)

      const response = await fetch('/api/raffles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create raffle')
      }

      if (isMounted) {
        toast.success('Raffle created successfully')
        form.reset()
        router.push('/dashboard/raffle')
      }
    } catch (error) {
      if (isMounted && !errorShown) {
        setErrorShown(true)
        toast.error(error instanceof Error ? error.message : 'Failed to create raffle')
      }
    } finally {
      if (isMounted) {
        setIsLoading(false)
      }
    }
  }

  const handleNext = () => {
    if (activeTab === 'basics') {
      setActiveTab('prize')
    } else if (activeTab === 'prize') {
      setActiveTab('settings')
    }
  }

  const handleBack = () => {
    if (activeTab === 'settings') {
      setActiveTab('prize')
    } else if (activeTab === 'prize') {
      setActiveTab('basics')
    }
  }

  const isBasicsValid = formValues.name && formValues.description && formValues.programAddress
  const isPrizeValid =
    prizeType !== 'TOKEN' || (formValues.prizeDetails?.token?.amount && formValues.prizeDetails?.token?.mint)

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (activeTab === 'settings' && !isLoading) {
            form.handleSubmit(onSubmit)(e)
          }
        }}
        className="space-y-8"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 bg-verxio-dark/50">
            <TabsTrigger value="basics" className="pixel-font">
              Basics
            </TabsTrigger>
            <TabsTrigger value="prize" className="pixel-font">
              Prize
            </TabsTrigger>
            <TabsTrigger value="settings" className="pixel-font">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="pixel-font">Raffle Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter raffle name"
                      {...field}
                      className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:text-white/50 text-[10px] text-white/50 placeholder:orbitron placeholder:text-[10px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="pixel-font">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter raffle description"
                      {...field}
                      className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:text-white/50 text-[10px] text-white/50 placeholder:orbitron placeholder:text-[10px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="programAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="pixel-font">Loyalty Program</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter verxio loyalty program address or a metaplex collection address"
                      {...field}
                      className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:text-white/50 text-[10px] text-white/50 placeholder:orbitron placeholder:text-[10px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="prize" className="space-y-4">
            <FormField
              control={form.control}
              name="prizeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="pixel-font">Prize Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron text-[10px] text-white/50">
                        <SelectValue placeholder="Select prize type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-verxio-dark border-verxio-purple/20">
                      <SelectItem
                        value="TOKEN"
                        className="orbitron text-[10px] text-white/50 hover:bg-verxio-purple/20"
                      >
                        Token
                      </SelectItem>
                      <SelectItem
                        value="MERCH"
                        className="orbitron text-[10px] text-white/50 hover:bg-verxio-purple/20"
                        disabled
                      >
                        Merchandise{' '}
                        <Badge variant="secondary" className="ml-2">
                          Coming Soon
                        </Badge>
                      </SelectItem>
                      <SelectItem
                        value="NFT"
                        className="orbitron text-[10px] text-white/50 hover:bg-verxio-purple/20"
                        disabled
                      >
                        NFT{' '}
                        <Badge variant="secondary" className="ml-2">
                          Coming Soon
                        </Badge>
                      </SelectItem>
                      <SelectItem
                        value="OTHER"
                        className="orbitron text-[10px] text-white/50 hover:bg-verxio-purple/20"
                        disabled
                      >
                        Other{' '}
                        <Badge variant="secondary" className="ml-2">
                          Coming Soon
                        </Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {prizeType === 'TOKEN' && (
              <>
                <FormField
                  control={form.control}
                  name="prizeDetails.token.amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="pixel-font">Token Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter token amount"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:text-white/50 text-[10px] text-white/50 placeholder:orbitron placeholder:text-[10px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prizeDetails.token.mint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="pixel-font">Token Mint</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron text-[10px] text-white/50">
                            <SelectValue placeholder="Select token" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-verxio-dark border-verxio-purple/20">
                          <SelectItem
                            value="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
                            className="orbitron text-[10px] text-white/50 hover:bg-verxio-purple/20"
                          >
                            USDC
                          </SelectItem>
                          <SelectItem
                            value="custom"
                            className="orbitron text-[10px] text-white/50 hover:bg-verxio-purple/20"
                            disabled
                          >
                            Custom Token{' '}
                            <Badge variant="secondary" className="ml-2">
                              Coming Soon
                            </Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="numWinners"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="pixel-font">Number of Winners</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Enter number of winners"
                      {...field}
                      onChange={(e) => field.onChange(Math.max(1, Number(e.target.value)))}
                      className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:font-press-start-2p placeholder:text-white/50 text-[10px] text-white/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {prizeType === 'TOKEN' && form.watch('prizeDetails.token.amount') > 0 && form.watch('numWinners') > 0 && (
              <div className="flex items-start gap-2 text-sm text-white/70">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  {form.watch('prizeDetails.token.amount')} USDC will be distributed across {form.watch('numWinners')}{' '}
                  winner{form.watch('numWinners') > 1 ? 's' : ''} (
                  {Number((form.watch('prizeDetails.token.amount') / form.watch('numWinners')).toFixed(1))} USDC per
                  winner)
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="pixel-font">Start Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:text-white/50 text-[10px] text-white/50 placeholder:orbitron placeholder:text-[10px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="pixel-font">End Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:text-white/50 text-[10px] text-white/50 placeholder:orbitron placeholder:text-[10px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="drawDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="pixel-font">Draw Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:text-white/50 text-[10px] text-white/50 placeholder:orbitron placeholder:text-[10px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="entryCost"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="pixel-font">Entry Cost (XP)</FormLabel>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="NB: Available for only verxio programs! Enter XP cost (leave empty for free entry)"
                      {...field}
                      disabled
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:text-white/50 text-[10px] text-white/50 placeholder:orbitron placeholder:text-[10px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minTier"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="pixel-font">Minimum Tier</FormLabel>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="NB: Available for only verxio programs! Enter minimum tier (leave empty for no minimum)"
                      {...field}
                      disabled
                      className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:text-white/50 text-[10px] text-white/50 placeholder:orbitron placeholder:text-[10px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-8">
          {activeTab !== 'basics' ? (
            <Button type="button" variant="outline" onClick={handleBack} className="pixel-font">
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/raffle')}
              className="pixel-font"
            >
              Cancel
            </Button>
          )}
          <div className="flex gap-4">
            {activeTab !== 'settings' ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={(activeTab === 'basics' && !isBasicsValid) || (activeTab === 'prize' && !isPrizeValid)}
                className="pixel-font bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="pixel-font bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Creating Raffle...
                  </div>
                ) : (
                  'Create Loyalty Raffle'
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}
