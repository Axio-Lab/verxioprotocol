'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useWallet } from '@solana/wallet-adapter-react'
import { createNewLoyaltyProgram, Tier } from '@/lib/methods/createLoyaltyProgram'
import { HexColorPicker } from 'react-colorful'
import { useVerxioProgram } from '@/lib/methods/initializeProgram'
import { useRouter } from 'next/navigation'
import ProgramCard from './ProgramCard'
import bs58 from 'bs58'
import { SuccessModal } from '@/components/ui/success-modal'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Info, Upload } from 'lucide-react'
import { generateImageUri } from '@/lib/metadata/generateImageUri'
import { generateNftMetadata } from '@/lib/metadata/generateNftMetadata'
import { useNetwork } from '@/lib/network-context'
import { storeLoyaltyProgram } from '@/app/actions/program'
import { generateSigner } from '@metaplex-foundation/umi'

const colorOptions = [
  { name: 'Purple', value: 'purple' },
  { name: 'Blue', value: 'blue' },
  { name: 'Cyan', value: 'cyan' },
  { name: 'Pink', value: 'pink' },
  { name: 'Green', value: 'green' },
]

type ProgramColor = 'purple' | 'blue' | 'cyan' | 'pink' | 'green'

interface LoyaltyCardCustomizerProps {
  onRotationComplete?: () => void
}

export default function LoyaltyCardCustomizer({ onRotationComplete }: LoyaltyCardCustomizerProps) {
  const { connected, publicKey: address } = useWallet()
  const { network } = useNetwork()
  const context = useVerxioProgram()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basics')
  const [formData, setFormData] = useState({
    loyaltyProgramName: '',
    description: '',
    bannerImage: null as File | null,
    metadata: {
      organizationName: '',
      brandColor: '#00adef', // Default
    },
    tiers: [{ name: '', xpRequired: 0, rewards: [''] }] as Tier[],
    pointsPerAction: {
      '': 0,
    } as Record<string, number>,
  })

  const [rotationCount, setRotationCount] = useState(0)
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState<{ title: string; message: string; signature?: string } | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'organizationName') {
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          organizationName: value,
        },
      })
    } else if (name === 'bannerImage' && e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData({
        ...formData,
        bannerImage: file,
      })
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleColorChange = (color: string) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        brandColor: color,
      },
    })
  }

  const handleTierConfigChange = (index: number, field: keyof Tier, value: any) => {
    const newTierConfigs = [...formData.tiers]
    newTierConfigs[index] = {
      ...newTierConfigs[index],
      [field]: value,
    }
    setFormData({ ...formData, tiers: newTierConfigs })
  }

  const handlePointsPerActionChange = (action: string, value: number) => {
    setFormData({
      ...formData,
      pointsPerAction: {
        ...formData.pointsPerAction,
        [action]: value,
      },
    })
  }

  const handleAddTier = () => {
    setFormData({
      ...formData,
      tiers: [...formData.tiers, { name: '', xpRequired: 0, rewards: [''] }],
    })
  }

  const handleRemoveTier = (index: number) => {
    const newTierConfigs = formData.tiers.filter((_, i) => i !== index)
    setFormData({ ...formData, tiers: newTierConfigs })
  }

  const handleAddAction = () => {
    setFormData({
      ...formData,
      pointsPerAction: {
        ...formData.pointsPerAction,
        '': 0,
      },
    })
  }

  const handleRemoveAction = (action: string) => {
    const { [action]: removed, ...rest } = formData.pointsPerAction
    setFormData({ ...formData, pointsPerAction: rest })
  }

  const handleNext = () => {
    if (activeTab === 'basics') {
      setActiveTab('rewards')
    } else if (activeTab === 'rewards') {
      setActiveTab('appearance')
    }
  }

  const handleBack = () => {
    if (activeTab === 'appearance') {
      setActiveTab('rewards')
    } else if (activeTab === 'rewards') {
      setActiveTab('basics')
    }
  }

  const isBasicsValid = formData.loyaltyProgramName && formData.description && formData.metadata.organizationName
  const isRewardsValid = formData.tiers.length > 0 && formData.tiers.every((tier) => tier.name && tier.xpRequired >= 0)
  const isAppearanceValid = formData.metadata.brandColor

  const handleSave = async () => {
    if (!connected || !address) {
      toast.error('Please connect your wallet to save the loyalty program')
      return
    }

    if (!context) {
      toast.error('Failed to initialize program context')
      return
    }

    if (!formData.loyaltyProgramName) {
      toast.error('Please provide a loyalty program name')
      return
    }

    if (!formData.description) {
      toast.error('Please provide a loyalty program description')
      return
    }

    if (!formData.bannerImage) {
      toast.error('Please upload a banner image')
      return
    }

    if (!formData.metadata.organizationName) {
      toast.error('Please provide name of host organization')
      return
    }

    setIsLoading(true)
    try {
      let imageUri = ''
      if (formData.bannerImage) {
        imageUri = await generateImageUri(formData.bannerImage)
      }

      const { uri } = await generateNftMetadata(
        {
          loyaltyProgramName: formData.loyaltyProgramName,
          metadata: {
            organizationName: formData.metadata.organizationName,
            brandColor: formData.metadata.brandColor,
          },
          tiers: formData.tiers,
          pointsPerAction: formData.pointsPerAction,
          metadataUri: imageUri,
        },
        imageUri,
        address.toString(),
        formData.bannerImage?.type,
      )

      const result = await createNewLoyaltyProgram(context, {
        loyaltyProgramName: formData.loyaltyProgramName,
        metadataUri: uri,
        metadata: {
          organizationName: formData.metadata.organizationName,
          brandColor: formData.metadata.brandColor,
        },
        tiers: formData.tiers,
        pointsPerAction: formData.pointsPerAction,
      })

      // Store in database using server action
      await storeLoyaltyProgram({
        creator: address.toString(),
        publicKey: result.collection.publicKey.toString(),
        privateKey: bs58.encode(result.collection.secretKey),
        signature: result.signature,
        network: network,
        programAuthorityPrivate: bs58.encode(result.updateAuthority!.secretKey),
        programAuthorityPublic: result.updateAuthority!.publicKey.toString(),
      })

      setSuccessData({
        title: 'Program Created Successfully',
        message: 'Your loyalty program has been created successfully',
        signature: result.signature,
      })
      setShowSuccessModal(true)

      // Clear form
      setFormData({
        loyaltyProgramName: '',
        description: '',
        bannerImage: null,
        metadata: {
          organizationName: '',
          brandColor: '#9d4edd',
        },
        tiers: [{ name: '', xpRequired: 0, rewards: [''] }],
        pointsPerAction: {
          '': 0,
        },
      })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating program:', error)
      toast.error('Failed to create loyalty program')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRotationComplete = () => {
    setRotationCount((prev) => prev + 1)
    setCurrentThemeIndex((prev) => (prev + 1) % colorOptions.length)
    setFormData((prev) => ({
      ...prev,
      programColor: colorOptions[(currentThemeIndex + 1) % colorOptions.length].value as ProgramColor,
    }))
    onRotationComplete?.()
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 max-w-[1400px] mx-auto">
      <div className="lg:w-1/2 space-y-6">
        <Card className="bg-verxio-dark border-verxio-purple/20">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-6 bg-verxio-dark/50">
                <TabsTrigger value="basics" className="pixel-font">
                  Basics
                </TabsTrigger>
                <TabsTrigger value="rewards" className="pixel-font">
                  Rewards
                </TabsTrigger>
                <TabsTrigger value="appearance" className="pixel-font">
                  Appearance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basics" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loyaltyProgramName" className="pixel-font">
                    Loyalty Program Name
                  </Label>
                  <Input
                    id="loyaltyProgramName"
                    name="loyaltyProgramName"
                    value={formData.loyaltyProgramName}
                    onChange={handleInputChange}
                    className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:text-white/50 text-[10px] text-white/50 placeholder:orbitron placeholder:text-[10px]"
                    placeholder="Enter loyalty program name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="pixel-font">
                    Description
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:text-white/50 text-[10px] text-white/50 placeholder:orbitron placeholder:text-[10px]"
                    placeholder="Enter program description"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="bannerImage" className="pixel-font">
                      Loyalty Banner
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                          <Info className="h-4 w-4 text-white/50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 bg-slate-900 border-slate-700/20">
                        <div className="space-y-2">
                          <h4 className="font-medium orbitron">Recommended Dimensions</h4>
                          <p className="text-sm text-white/90">For best results, use an image with:</p>
                          <ul className="text-sm text-white/90 list-disc list-inside">
                            <li>Width: 400px</li>
                            <li>Height: 250px</li>
                            <li>Format: PNG, JPG, or GIF</li>
                          </ul>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="bannerImage"
                      name="bannerImage"
                      type="file"
                      accept="image/*,.gif"
                      onChange={handleInputChange}
                      className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:text-white/50 text-[10px] text-white/50 placeholder:orbitron placeholder:text-[10px] cursor-pointer"
                    />
                    <Button variant="outline" size="icon" className="h-10 w-10">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationName" className="pixel-font">
                    Organization Name
                  </Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    value={formData.metadata.organizationName}
                    onChange={handleInputChange}
                    className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:text-white/50 text-[10px] text-white/50 placeholder:orbitron placeholder:text-[10px]"
                    placeholder="Enter organization name"
                  />
                </div>
              </TabsContent>

              <TabsContent value="rewards" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="pixel-font">Tier Configuration</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddTier}
                      className="text-white/70 hover:text-white"
                    >
                      + Add Tier
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.tiers.map((tier, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded border-verxio-purple/20 bg-verxio-dark/50 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <Input
                            value={tier.name}
                            onChange={(e) => handleTierConfigChange(index, 'name', e.target.value)}
                            className="w-32 bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:orbitron placeholder:text-[10px] text-[10px] text-white/50"
                            placeholder="Tier name"
                          />
                          <Input
                            type="number"
                            value={tier.xpRequired}
                            onChange={(e) => handleTierConfigChange(index, 'xpRequired', parseInt(e.target.value) || 0)}
                            className="w-32 bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:orbitron placeholder:text-[10px] text-[10px] text-white/50"
                            placeholder="XP Required"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTier(index)}
                            className="text-white/70 hover:text-white"
                          >
                            ×
                          </Button>
                        </div>
                        <div className="flex flex-col gap-1">
                          {tier.rewards.map((reward, rewardIndex) => (
                            <div key={rewardIndex} className="flex items-center gap-2">
                              <Input
                                value={reward}
                                onChange={(e) => {
                                  const newRewards = [...tier.rewards]
                                  newRewards[rewardIndex] = e.target.value
                                  handleTierConfigChange(index, 'rewards', newRewards)
                                }}
                                className="bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:orbitron placeholder:text-[10px] text-[10px] text-white/50"
                                placeholder="Reward description"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newRewards = tier.rewards.filter((_, i) => i !== rewardIndex)
                                  handleTierConfigChange(index, 'rewards', newRewards)
                                }}
                                className="text-white/70 hover:text-white"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newRewards = [...tier.rewards, '']
                              handleTierConfigChange(index, 'rewards', newRewards)
                            }}
                            className="text-white/70 hover:text-white"
                          >
                            + Add Reward
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="pixel-font">Points per Action</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddAction}
                      className="text-white/70 hover:text-white"
                    >
                      + Add Action
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(formData.pointsPerAction).map(([action, points], index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 border rounded border-verxio-purple/20 bg-verxio-dark/50"
                      >
                        <Input
                          value={action}
                          onChange={(e) => {
                            const newActions = {
                              ...formData.pointsPerAction,
                            }
                            delete newActions[action]
                            newActions[e.target.value] = points
                            setFormData({
                              ...formData,
                              pointsPerAction: newActions,
                            })
                          }}
                          className="w-32 bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:orbitron placeholder:text-[10px] text-[10px] text-white/50"
                          placeholder="Action name"
                        />
                        <Input
                          type="number"
                          value={points}
                          onChange={(e) => handlePointsPerActionChange(action, parseInt(e.target.value) || 0)}
                          className="w-24 bg-verxio-dark/50 border-verxio-purple/20 focus:border-verxio-purple orbitron placeholder:orbitron placeholder:text-[10px] text-[10px] text-white/50"
                          placeholder="Points"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAction(action)}
                          className="text-white/70 hover:text-white"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="pixel-font">Brand Color</Label>
                    <div className="flex items-center gap-4">
                      <HexColorPicker
                        color={formData.metadata.brandColor}
                        onChange={handleColorChange}
                        className="w-[300px] h-[200px]"
                      />
                      <div
                        className="w-16 h-16 rounded-full border-2 border-white/20"
                        style={{ backgroundColor: formData.metadata.brandColor }}
                      />
                    </div>
                  </div>

                  <div
                    className="mt-4 p-4 rounded-lg border border-white/20"
                    style={{
                      background: `linear-gradient(135deg, ${formData.metadata.brandColor}40, ${formData.metadata.brandColor}20)`,
                    }}
                  >
                    <p className="text-white/70 text-sm">Preview of your color scheme</p>
                  </div>
                </div>
              </TabsContent>

              <div className="flex justify-between mt-8">
                {activeTab !== 'basics' && (
                  <Button type="button" variant="outline" onClick={handleBack} className="pixel-font">
                    Back
                  </Button>
                )}
                <div className="flex gap-4">
                  {activeTab !== 'appearance' ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={
                        (activeTab === 'basics' && !isBasicsValid) || (activeTab === 'rewards' && !isRewardsValid)
                      }
                      className="pixel-font bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      onClick={handleSave}
                      disabled={isLoading || !isAppearanceValid || !connected}
                      className="pixel-font bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          Creating Program...
                        </div>
                      ) : connected ? (
                        'Create Loyalty Program'
                      ) : (
                        'Connect Wallet to Create'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="lg:w-1/2">
        <div className="sticky top-20">
          <div className="flex justify-center">
            <div className="w-full max-w-[500px] relative">
              {/* Glowing backdrop */}
              <div className="absolute -inset-4 bg-gradient-radial from-verxio-purple/30 to-transparent opacity-70 blur-xl rounded-full animate-pulse" />

              {/* Orbit effect */}
              <motion.div
                className="absolute -inset-12 border border-verxio-purple/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                onAnimationComplete={handleRotationComplete}
              >
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-verxio-purple animate-pulse" />
              </motion.div>

              <motion.div
                className="relative"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <ProgramCard
                  programName={formData.loyaltyProgramName || 'Verxio Loyalty Program'}
                  organizationName={formData.metadata.organizationName || 'Verxio Protocol'}
                  brandColor={formData.metadata.brandColor}
                  creator={address?.toString() || 'VERXIO76abNGYsQa4vjLcCJ4zx8vbtrVWTR'}
                  pointsPerAction={formData.pointsPerAction}
                  collectionAddress="VERXIO25rNGYsQa4vjLAcCJ4zx8vZ4BSqQoCb"
                  qrCodeUrl={''}
                  bannerImage={bannerPreview}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successData?.title || ''}
        message={successData?.message || ''}
        transactionSignature={successData?.signature}
        network={network}
      />
    </div>
  )
}
