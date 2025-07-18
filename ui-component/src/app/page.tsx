'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import ApproveTransferForm from '@/components/verxio/ApproveTransferForm'
import CreateLoyaltyProgramForm from '@/components/verxio/CreateLoyaltyProgramForm'
import UpdateLoyaltyProgramForm from '@/components/verxio/UpdateLoyaltyProgramForm'
import MessagingForm from '@/components/verxio/MessagingForm'
import RevokeLoyaltyPointsForm from '@/components/verxio/RevokeLoyaltyPointsForm'
import GiftLoyaltyPointsForm from '@/components/verxio/GiftLoyaltyPointsForm'
import IssueLoyaltyPassForm from '@/components/verxio/IssueLoyaltyPassForm'
import GetAssetDataForm from '@/components/verxio/GetAssetDataForm'
import GetProgramDetailsForm from '@/components/verxio/GetProgramDetailsForm'
import AwardLoyaltyPointsForm from '@/components/verxio/AwardLoyaltyPointsForm'
import BroadcastsForm from '@/components/verxio/BroadcastsForm'
import CreateVoucherCollectionForm from '@/components/verxio/CreateVoucherCollectionForm'
import MintVoucherForm from '@/components/verxio/MintVoucherForm'
import ValidateVoucherForm from '@/components/verxio/ValidateVoucherForm'
import RedeemVoucherForm from '@/components/verxio/RedeemVoucherForm'
import GetUserVouchersForm from '@/components/verxio/GetUserVouchersForm'
import ExtendVoucherExpiryForm from '@/components/verxio/ExtendVoucherExpiryForm'
import CancelVoucherForm from '@/components/verxio/CancelVoucherForm'
import { WalletMultiButton as WalletButton } from '@solana/wallet-adapter-react-ui'

const FORMS = {
  'create-loyalty-program': CreateLoyaltyProgramForm,
  'issue-loyalty-pass': IssueLoyaltyPassForm,
  'create-voucher-collection': CreateVoucherCollectionForm,
  'mint-voucher': MintVoucherForm,
  'validate-voucher': ValidateVoucherForm,
  'redeem-voucher': RedeemVoucherForm,
  'get-user-vouchers': GetUserVouchersForm,
  'extend-voucher-expiry': ExtendVoucherExpiryForm,
  'cancel-voucher': CancelVoucherForm,
  'approve-transfer': ApproveTransferForm,
  'update-loyalty-program': UpdateLoyaltyProgramForm,
  'send-message': MessagingForm,
  'revoke-points': RevokeLoyaltyPointsForm,
  'gift-points': GiftLoyaltyPointsForm,
  'get-asset': GetAssetDataForm,
  'get-program': GetProgramDetailsForm,
  'award-points': AwardLoyaltyPointsForm,
  'send-broadcast': BroadcastsForm,
} as const

type FormType = keyof typeof FORMS

function FormNavigation({
  activeForm,
  onFormSelect,
}: {
  activeForm: FormType
  onFormSelect: (form: FormType) => void
}) {
  return (
    <div className="w-full md:w-64 bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Verxio Forms</h2>
      <nav className="space-y-2">
        {Object.keys(FORMS).map((formKey) => (
          <button
            key={formKey}
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onFormSelect(formKey as FormType)
            }}
            className={`w-full text-left px-4 py-2.5 rounded-md transition-colors duration-200 ease-in-out relative z-20
              ${
                activeForm === formKey
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {formKey
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </button>
        ))}
      </nav>
    </div>
  )
}

function FormDisplay({ activeForm }: { activeForm: FormType }) {
  const ActiveFormComponent = FORMS[activeForm]

  return (
    <div className="flex-1 bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        {activeForm
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}
      </h1>
      <div className="bg-white rounded-lg">
        <ActiveFormComponent key={activeForm} />
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-semibold text-gray-900">Verxio Component Library</h1>
          <div className="relative">
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  )
}

export default function TestFormPage() {
  const [activeForm, setActiveForm] = useState<FormType>('create-loyalty-program')
  const { connected, publicKey: walletPublicKey, wallet } = useWallet()

  if (!connected || !walletPublicKey) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-lg shadow p-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Connect Your Wallet</h2>
                <p className="text-gray-600 max-w-md">
                  Please connect your Solana wallet to access the Verxio Component Library.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleFormSelect = (form: FormType) => {
    setActiveForm(form)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row gap-6">
            <FormNavigation activeForm={activeForm} onFormSelect={handleFormSelect} />
            <FormDisplay activeForm={activeForm} />
          </div>
        </div>
      </div>
    </div>
  )
}
