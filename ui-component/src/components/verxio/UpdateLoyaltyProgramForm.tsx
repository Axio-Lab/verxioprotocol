'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { updateLoyaltyProgram, VerxioContext } from '@verxioprotocol/core'
import { VerxioForm } from './base/VerxioForm'
import { VerxioFormSection } from './base/VerxioFormSection'
import { VerxioFormField } from './base/VerxioFormField'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { KeypairSigner, publicKey } from '@metaplex-foundation/umi'
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
  collectionAddress: z.string().min(1, 'Collection address is required'),
  pointsPerAction: z.array(actionSchema).min(1, 'At least one action is required'),
  tiers: z.array(tierSchema).min(1, 'At least one tier is required'),
})

type FormData = z.infer<typeof formSchema>

interface UpdateLoyaltyProgramResult {
  signature: string
}

interface UpdateLoyaltyProgramFormProps {
  context: VerxioContext
  signer: KeypairSigner
  onSuccess?: (result: UpdateLoyaltyProgramResult) => void
  onError?: (error: Error) => void
}

export default function UpdateLoyaltyProgramForm({
  context,
  signer,
  onSuccess,
  onError,
}: UpdateLoyaltyProgramFormProps) {
  const [updateResult, setUpdateResult] = useState<UpdateLoyaltyProgramResult | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collectionAddress: '',
      pointsPerAction: [{ name: '', points: 0 }],
      tiers: [
        {
          name: '',
          points: 0,
          rewards: [''],
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
          message: 'Please check all required fields are filled correctly',
        })
        return
      }

      // Prepare the request payload
      const payload = {
        collectionAddress: data.collectionAddress,
        newTiers: data.tiers,
        newPointsPerAction: data.pointsPerAction,
      }

      // Call the backend API
      const response = await fetch('/api/update-loyalty-program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update loyalty program')
      }

      const result = await response.json()
      setUpdateResult(result.result)
      onSuccess?.(result.result)

      // Reset form after successful update
      form.reset({
        collectionAddress: '',
        pointsPerAction: [{ name: '', points: 0 }],
        tiers: [
          {
            name: '',
            points: 0,
            rewards: [''],
          },
        ],
      })
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while updating the loyalty program'
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
      form.setValue(
        'pointsPerAction',
        actions.filter((_, i) => i !== index),
      )
    }
  }

  const handleAddTier = () => {
    const tiers = form.getValues('tiers')
    form.setValue('tiers', [
      ...tiers,
      {
        name: '',
        points: 0,
        rewards: [''],
      },
    ])
  }

  const handleRemoveTier = (index: number) => {
    const tiers = form.getValues('tiers')
    if (tiers.length > 1) {
      form.setValue(
        'tiers',
        tiers.filter((_, i) => i !== index),
      )
    }
  }

  const handleAddReward = (tierIndex: number) => {
    const tiers = form.getValues('tiers')
    tiers[tierIndex].rewards.push('')
    form.setValue('tiers', tiers)
  }

  const handleRemoveReward = (tierIndex: number, rewardIndex: number) => {
    const tiers = form.getValues('tiers')
    if (tiers[tierIndex].rewards.length > 1) {
      tiers[tierIndex].rewards = tiers[tierIndex].rewards.filter((_, i) => i !== rewardIndex)
      form.setValue('tiers', tiers)
    }
  }

  return (
    <div className="space-y-8">
      <VerxioForm form={form} onSubmit={onSubmit} className="space-y-8">
        <VerxioFormSection title="Program Information" description="Specify the program to update">
          <VerxioFormField
            form={form}
            name="collectionAddress"
            label="Collection Address"
            description="The unique address of your loyalty program collection"
          >
            <Input
              placeholder="Enter the collection address"
              onChange={(e) => form.setValue('collectionAddress', e.target.value)}
            />
          </VerxioFormField>
        </VerxioFormSection>

        <VerxioFormSection title="Points Configuration" description="Update points awarded for different actions">
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
                      placeholder="100"
                      onChange={(e) => {
                        const actions = form.getValues('pointsPerAction')
                        actions[index].points = parseInt(e.target.value) || 0
                        form.setValue('pointsPerAction', actions)
                      }}
                    />
                  </VerxioFormField>
                </div>
                {form.watch('pointsPerAction').length > 1 && (
                  <Button type="button" variant="destructive" onClick={() => handleRemoveAction(index)}>
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

        <VerxioFormSection title="Tier Configuration" description="Configure loyalty program tiers and rewards">
          <div className="space-y-6">
            {form.watch('tiers').map((tier, tierIndex) => (
              <div
                key={tierIndex}
                className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {tierIndex + 1}
                    </div>
                    <h5 className="font-semibold">Tier {tierIndex + 1}</h5>
                  </div>
                  {form.watch('tiers').length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTier(tierIndex)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
                      placeholder="500"
                      onChange={(e) => {
                        const tiers = form.getValues('tiers')
                        tiers[tierIndex].points = parseInt(e.target.value) || 0
                        form.setValue('tiers', tiers)
                      }}
                    />
                  </VerxioFormField>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h6 className="font-medium">Rewards</h6>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddReward(tierIndex)}>
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
                            onChange={(e) => {
                              const tiers = form.getValues('tiers')
                              tiers[tierIndex].rewards[rewardIndex] = e.target.value
                              form.setValue('tiers', tiers)
                            }}
                          />
                        </VerxioFormField>
                      </div>
                      {tier.rewards.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveReward(tierIndex, rewardIndex)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddTier}>
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
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Updating Program...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Update Program
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
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{form.formState.errors.root.message}</div>
              </div>
            </div>
          </div>
        )}
      </VerxioForm>

      {/* Transaction Result Display */}
      {updateResult && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Loyalty Program Updated Successfully!</h2>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Transaction Confirmed
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p>
                <span className="font-medium">Transaction Signature:</span>
              </p>
              <p className="font-mono text-sm break-all">{updateResult.signature}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
