'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createLoyaltyProgram, VerxioContext } from '@verxioprotocol/core'
import { generateSigner, KeypairSigner } from '@metaplex-foundation/umi'
import { VerxioForm } from '@/components/verxio/base/VerxioForm'
import { VerxioFormSection } from '@/components/verxio/base/VerxioFormSection'
import { VerxioFormField } from '@/components/verxio/base/VerxioFormField'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const actionSchema = z.object({
  name: z.string().min(1, 'Action name is required'),
  points: z.number().min(0, 'Points must be positive'),
})

const tierSchema = z.object({
  name: z.string().min(1, 'Tier name is required'),
  points: z.number().min(0, 'Points must be positive'),
  rewards: z.array(z.string()).min(1, 'At least one reward is required'),
})

const formSchema = z.object({
  programName: z.string().min(1, 'Program name is required'),
  metadataUri: z.string().url('Must be a valid URL'),
  organizationName: z.string().min(1, 'Organization name is required'),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  pointsPerAction: z.array(actionSchema).min(1, 'At least one action is required'),
  tiers: z.array(tierSchema).min(1, 'At least one tier is required'),
})

type FormData = z.infer<typeof formSchema>

interface CreateLoyaltyProgramResult {
  collection: KeypairSigner
  signature: string
  updateAuthority?: KeypairSigner
}

interface CreateLoyaltyProgramFormProps {
  context: VerxioContext
  signer?: KeypairSigner
  onSuccess?: (result: CreateLoyaltyProgramResult) => void
  onError?: (error: Error) => void
}

export default function CreateLoyaltyProgramForm({ 
  context,
  signer: providedSigner,
  onSuccess,
  onError 
}: CreateLoyaltyProgramFormProps) {
  const [createdProgram, setCreatedProgram] = useState<CreateLoyaltyProgramResult | null>(null)
  const signer = providedSigner || generateSigner(context.umi)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programName: '',
      metadataUri: '',
      organizationName: '',
      brandColor: '#00adef',
      pointsPerAction: [
        { name: '', points: 0 },
      ],
      tiers: [
        { 
          name: '', 
          points: 0, 
          rewards: ['']
        },
      ],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // Debug form validation
      const validationResult = formSchema.safeParse(data)
      if (!validationResult.success) {
        console.error('Validation errors:', validationResult.error.format())
        form.setError('root', { 
          message: 'Please check all required fields are filled correctly' 
        })
        return
      }

      // Format data for createLoyaltyProgram
      const programData = {
        loyaltyProgramName: data.programName,
        metadataUri: data.metadataUri,
        programAuthority: context.programAuthority,
        updateAuthority: signer,
        metadata: {
          organizationName: data.organizationName,
          brandColor: data.brandColor,
        },
        tiers: data.tiers.map(tier => ({
          name: tier.name,
          xpRequired: tier.points,
          rewards: tier.rewards,
        })),
        pointsPerAction: Object.fromEntries(
          data.pointsPerAction.map(action => [action.name, action.points])
        ),
      }
      
      console.log('programData', programData)
      const result = await createLoyaltyProgram(context, programData)
      setCreatedProgram(result)
      onSuccess?.(result)
      
      // Reset form after successful creation
      form.reset()
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating the loyalty program'
      form.setError('root', { message: errorMessage })
      onError?.(error instanceof Error ? error : new Error(errorMessage))
    }
  }

  const handleAddAction = () => {
    const actions = form.getValues('pointsPerAction')
    form.setValue('pointsPerAction', [...actions, { name: '', points: 0 }])
  }

  const handleRemoveAction = (index: number) => {
    const actions = form.getValues('pointsPerAction')
    if (actions.length > 1) {
      form.setValue('pointsPerAction', actions.filter((_, i) => i !== index))
    }
  }

  const handleAddTier = () => {
    const tiers = form.getValues('tiers')
    form.setValue('tiers', [
      ...tiers,
      { 
        name: '', 
        points: 0, 
        rewards: [''] 
      },
    ])
  }

  const handleRemoveTier = (index: number) => {
    const tiers = form.getValues('tiers')
    if (tiers.length > 1) {
      form.setValue('tiers', tiers.filter((_, i) => i !== index))
    }
  }

  const handleAddReward = (tierIndex: number) => {
    const tiers = form.getValues('tiers')
    const newTiers = [...tiers]
    newTiers[tierIndex] = {
      ...newTiers[tierIndex],
      rewards: [...newTiers[tierIndex].rewards, '']
    }
    form.setValue('tiers', newTiers)
  }

  const handleRemoveReward = (tierIndex: number, rewardIndex: number) => {
    const tiers = form.getValues('tiers')
    const newTiers = [...tiers]
    if (newTiers[tierIndex].rewards.length > 1) {
      newTiers[tierIndex] = {
        ...newTiers[tierIndex],
        rewards: newTiers[tierIndex].rewards.filter((_, i) => i !== rewardIndex)
      }
      form.setValue('tiers', newTiers)
    }
  }

  return (
    <div className="space-y-8">
      <VerxioForm form={form} onSubmit={onSubmit} className="space-y-8">
        <VerxioFormSection
          title=""
          description=""
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VerxioFormField
              form={form}
              name="programName"
              label="Program Name"
              description="The name of your loyalty program"
            >
              <Input 
                placeholder="e.g., Coffee Rewards Program" 
                onChange={(e) => form.setValue('programName', e.target.value)}
              />
            </VerxioFormField>

            <VerxioFormField
              form={form}
              name="organizationName"
              label="Organization Name"
              description="Your organization's name"
            >
              <Input 
                placeholder="e.g., Coffee Brew Co." 
                onChange={(e) => form.setValue('organizationName', e.target.value)}
              />
            </VerxioFormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <VerxioFormField
                form={form}
                name="metadataUri"
                label="Metadata URI"
                description="The URI where your program metadata is stored"
              >
                <Input 
                  placeholder="https://arweave.net/..." 
                  onChange={(e) => form.setValue('metadataUri', e.target.value)}
                />
              </VerxioFormField>
            </div>

            <VerxioFormField
              form={form}
              name="brandColor"
              label="Brand Color"
              description="Your brand's primary color"
            >
              <div className="flex items-center gap-3">
                <Input 
                  type="color" 
                  className="w-14 h-14 p-1"
                  value={form.watch('brandColor')}
                  onChange={(e) => form.setValue('brandColor', e.target.value)}
                />
                <Input 
                  type="text"
                  value={form.watch('brandColor')}
                  onChange={(e) => form.setValue('brandColor', e.target.value)}
                />
              </div>
            </VerxioFormField>
          </div>
        </VerxioFormSection>

        <VerxioFormSection
          title="Points Per Action"
          description="Configure the actions that earn points and their values"
        >
          <div className="space-y-6">
            {form.watch('pointsPerAction').map((_, index) => (
              <div key={index} className="flex items-end gap-4">
                <div className="flex-1">
                  <VerxioFormField
                    form={form}
                    name={`pointsPerAction.${index}.name`}
                    label="Action Name"
                    description="Name of the action that earns points"
                  >
                    <Input 
                      placeholder="e.g., purchase, review, referral"
                      onChange={(e) => {
                        const actions = form.getValues('pointsPerAction')
                        actions[index].name = e.target.value
                        form.setValue('pointsPerAction', actions)
                      }}
                    />
                  </VerxioFormField>
                </div>
                <div className="flex-1">
                  <VerxioFormField
                    form={form}
                    name={`pointsPerAction.${index}.points`}
                    label="Points"
                    description="Points awarded for this action"
                  >
                    <Input 
                      type="number" 
                      min={0}
                      onChange={(e) => {
                        const actions = form.getValues('pointsPerAction')
                        actions[index].points = parseInt(e.target.value) || 0
                        form.setValue('pointsPerAction', actions)
                      }}
                    />
                  </VerxioFormField>
                </div>
                {form.watch('pointsPerAction').length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleRemoveAction(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddAction}>
              Add Action
            </Button>
          </div>
        </VerxioFormSection>

        <VerxioFormSection
          title="Reward Tiers"
          description="Define the tiers and rewards for your loyalty program"
        >
          <div className="space-y-6">
            {form.watch('tiers').map((tier, tierIndex) => (
              <div key={tierIndex} className="p-6 bg-gray-800 border border-gray-700 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {tierIndex + 1}
                    </div>
                    <h5 className="font-semibold text-gray-100">Tier {tierIndex + 1}</h5>
                  </div>
                  {form.watch('tiers').length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTier(tierIndex)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/50"
                    >
                      Remove Tier
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <VerxioFormField
                    form={form}
                    name={`tiers.${tierIndex}.name`}
                    label="Tier Name"
                    description="Name of the loyalty tier"
                  >
                    <Input 
                      placeholder="e.g., Bronze"
                      onChange={(e) => {
                        const tiers = form.getValues('tiers')
                        tiers[tierIndex].name = e.target.value
                        form.setValue('tiers', tiers)
                      }}
                      className="bg-gray-800 border-gray-700 text-gray-100"
                    />
                  </VerxioFormField>

                  <VerxioFormField
                    form={form}
                    name={`tiers.${tierIndex}.points`}
                    label="Required Points"
                    description="Points needed to reach this tier"
                  >
                    <Input 
                      type="number" 
                      min={0}
                      onChange={(e) => {
                        const tiers = form.getValues('tiers')
                        tiers[tierIndex].points = parseInt(e.target.value) || 0
                        form.setValue('tiers', tiers)
                      }}
                      className="bg-gray-800 border-gray-700 text-gray-100"
                    />
                  </VerxioFormField>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h6 className="font-medium text-gray-100">Rewards</h6>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddReward(tierIndex)}
                      className="border-gray-700 text-gray-300 hover:bg-gray-700"
                    >
                      Add Reward
                    </Button>
                  </div>

                  {tier.rewards.map((_, rewardIndex) => (
                    <div key={rewardIndex} className="flex items-end gap-4">
                      <div className="flex-1">
                        <VerxioFormField
                          form={form}
                          name={`tiers.${tierIndex}.rewards.${rewardIndex}`}
                          label=""
                          description="Reward for this tier"
                        >
                          <Input 
                            placeholder="e.g., 10% cashback"
                            value={tier.rewards[rewardIndex]}
                            onChange={(e) => {
                              const tiers = form.getValues('tiers')
                              const newTiers = [...tiers]
                              newTiers[tierIndex] = {
                                ...newTiers[tierIndex],
                                rewards: newTiers[tierIndex].rewards.map((reward, i) => 
                                  i === rewardIndex ? e.target.value : reward
                                )
                              }
                              form.setValue('tiers', newTiers)
                            }}
                            className="bg-gray-800 border-gray-700 text-gray-100"
                          />
                        </VerxioFormField>
                      </div>
                      {tier.rewards.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveReward(tierIndex, rewardIndex)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddTier}
              className="border-gray-700 text-gray-300 hover:bg-gray-700"
            >
              Add Tier
            </Button>
          </div>
        </VerxioFormSection>

        <div className="flex justify-center pt-8">
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting}
            className="px-12 py-4 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {form.formState.isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Program...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Program
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {form.formState.errors.root && (
          <div className="rounded-lg bg-red-50 p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {form.formState.errors.root.message}
                </div>
              </div>
            </div>
          </div>
        )}
      </VerxioForm>

      {/* Transaction Result Display */}
      {createdProgram && (
        <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-100">Program Created Successfully!</h2>
            <div className="px-3 py-1 bg-green-900/50 text-green-200 rounded-full text-sm font-medium">
              Transaction Confirmed
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-gray-300"><span className="font-medium">Transaction Signature:</span></p>
                <p className="font-mono text-sm break-all text-gray-400">{createdProgram.signature}</p>
              </div>
            </div>

            {/* Collection Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Collection Details</h3>
              <div className="space-y-2">
                <p className="text-gray-300"><span className="font-medium">Collection Public Key:</span></p>
                <p className="font-mono text-sm break-all text-gray-400">{createdProgram.collection.publicKey}</p>
                {createdProgram.updateAuthority && (
                  <>
                    <p className="text-gray-300"><span className="font-medium">Update Authority Public Key:</span></p>
                    <p className="font-mono text-sm break-all text-gray-400">{createdProgram.updateAuthority.publicKey}</p>
                  </>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Next Steps</h3>
              <div className="p-4 bg-blue-900/50 rounded-lg">
                <p className="text-blue-200">
                  Your loyalty program has been created successfully! You can now:
                </p>
                <ul className="mt-2 list-disc list-inside text-blue-300">
                  <li>Use the collection address to create loyalty passes</li>
                  <li>Update program details using the update authority</li>
                  <li>View program details using the GetProgramDetails form</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
