import { CheckCircle2, ExternalLink } from 'lucide-react'
import { Button } from './button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  transactionSignature?: string
  network?: string
}

export function SuccessModal({ isOpen, onClose, title, message, transactionSignature, network }: SuccessModalProps) {
  const explorerUrl = transactionSignature
    ? `https://solscan.io/tx/${transactionSignature}${network === 'devnet' ? '?cluster=devnet' : ''}`
    : undefined

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-black/20 backdrop-blur-sm border-slate-800/20">
        <DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-green-500/10 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <DialogTitle className="text-center text-xl orbitron">{title}</DialogTitle>
            <DialogDescription className="text-center text-white/70">{message}</DialogDescription>
          </div>
        </DialogHeader>
        {explorerUrl && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              className="bg-transparent border-slate-700/20 hover:bg-slate-800/20"
              onClick={() => window.open(explorerUrl, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Solscan
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
