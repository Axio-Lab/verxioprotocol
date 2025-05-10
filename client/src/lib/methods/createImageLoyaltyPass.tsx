import { Builder, Font, FontFactory } from 'canvacord'
import QRCode from 'qrcode'

interface LoyaltyPassData {
  xp: number
  currentTier: string
  name: string
  owner: string
  pass: string
  lastAction: string | null
  actionHistory: Array<any>
  rewards: string[]
  metadata: {
    organizationName: string
    brandColor?: string
    qrCodeUrl?: string
  }
  rewardTiers: Array<{
    name: string
    xpRequired: number
    rewards: string[]
  }>
}

class CreateImageLoyaltyPass extends Builder {
  constructor(
    private readonly vars: {
      data: LoyaltyPassData
    },
  ) {
    // Set a larger size for the loyalty card
    super(500, 500)

    // Load default font if none loaded
    if (!FontFactory.size) Font.loadDefault()
  }

  private getGradientColors(brandColor: string): string[] {
    // Convert hex to RGB
    const r = parseInt(brandColor.slice(1, 3), 16)
    const g = parseInt(brandColor.slice(3, 5), 16)
    const b = parseInt(brandColor.slice(5, 7), 16)

    // Create lighter and darker versions
    const lighter = `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`
    const darker = `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`

    return [lighter, brandColor, darker]
  }

  private formatNumber(num: number): string {
    return num.toLocaleString('en-US', {
      maximumFractionDigits: 0,
    })
  }

  async render() {
    const { data } = this.vars
    const colors = this.getGradientColors(data.metadata.brandColor || '#ab9f90')
    const nextTier = data.rewardTiers.find((tier) => tier.xpRequired > data.xp) || data.rewardTiers[0]
    const progress = (data.xp / nextTier.xpRequired) * 100
    const qrCodeUrl = data.metadata.qrCodeUrl || `https://verxio.xyz/pass/${data.pass}`
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      width: 120,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e6e9f0 100%)',
          borderRadius: '20px',
          padding: '30px',
          color: '#333',
          fontFamily: 'Arial, sans-serif',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '60%',
            height: '100%',
            background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
            opacity: 0.1,
            transform: 'skewX(-15deg)',
            zIndex: 0,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            position: 'relative',
            zIndex: 1,
            flexDirection: 'column',
            flex: 1,
            width: '100%',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
              width: '100%',
            }}
          >
            {/* Program Name and Organization */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span
                style={{
                  fontFamily: 'Press Start 2P',
                  margin: '0 0 8px 0',
                  fontSize: '26px',
                  color: colors[1],
                  textShadow: `0 0 8px ${colors[1]}55`,
                  letterSpacing: '1px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '250px',
                }}
              >
                {data.name}
              </span>
              <span
                style={{
                  fontSize: '15px',
                  color: '#666',
                  marginTop: '2px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 360,
                }}
              >
                by {data.metadata.organizationName}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                background: colors[1],
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 600,
                boxShadow: `0 4px 10px ${colors[1]}22`,
              }}
            >
              {data.currentTier.toUpperCase()}
            </div>
          </div>

          {/* Pass Address */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              background: 'rgba(240,240,255,0.7)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '16px',
              border: `1px solid ${colors[1]}22`,
              boxShadow: '0 1px 4px #0001',
              marginTop: 'auto',
            }}
          >
            <span
              style={{
                fontSize: '9px',
                color: '#666',
                fontFamily: 'monospace',
                fontWeight: 500,
                wordBreak: 'break-all',
              }}
            >
              <b style={{ color: colors[1], fontWeight: 700 }}>Pass: </b> {data.pass}
            </span>
            <span
              style={{
                fontSize: '9px',
                color: '#666',
                fontFamily: 'monospace',
                fontWeight: 500,
                wordBreak: 'break-all',
              }}
            >
              <b style={{ color: colors[1], fontWeight: 700 }}>Owner: </b> {data.owner}
            </span>
          </div>

          {/* Divider */}
          <div
            style={{ width: '100%', height: '1px', background: '#e0e0e0', margin: '0 0 16px 0', borderRadius: '1px' }}
          />

          {/* Total Points Earned */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
              padding: '14px',
              borderRadius: '12px',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: `1px solid ${colors[1]}22`,
            }}
          >
            <h3 style={{ fontSize: '14px', margin: '0 0 6px 0', color: '#333', fontWeight: 700 }}>
              Total Points Earned
            </h3>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#333',
                fontFamily: 'Press Start 2P',
                textShadow: `0 0 8px ${colors[1]}55`,
              }}
            >
              {this.formatNumber(data.xp)} XP
            </span>
          </div>

          {/* Divider */}
          <div
            style={{ width: '100%', height: '1px', background: '#e0e0e0', margin: '0 0 16px 0', borderRadius: '1px' }}
          />

          {/* Progress Bar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '16px',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                background: '#f0f0f0',
                height: '16px',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`,
                  width: `${progress}%`,
                  height: '100%',
                  transition: 'width 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '6px',
                fontSize: '11px',
                color: '#666',
                width: '100%',
              }}
            >
              <span>Last Action: {data.lastAction || 'None'}</span>
              <span>
                Next Tier: {nextTier.name}: {nextTier.xpRequired} XP
              </span>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{ width: '100%', height: '1px', background: '#e0e0e0', margin: '0 0 16px 0', borderRadius: '1px' }}
          />

          {/* QR Row and Footer */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: 'auto', gap: '6px' }}>
            {/* QR Row */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                background: `linear-gradient(135deg, #fff, ${colors[0]})`,
                padding: '10px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: `1px solid ${colors[1]}22`,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px', flex: 1 }}>
                <span style={{ fontSize: '16px', color: '#bbb' }}>👥</span>
                <span style={{ fontSize: '12px', color: '#888', fontWeight: 500 }}>Scan to view loyalty details</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  background: 'white',
                  padding: '3px',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px #0001',
                  border: `1px solid ${colors[1]}22`,
                  flexShrink: 0,
                }}
              >
                <img src={qrCodeDataUrl} alt="QR Code" style={{ width: '55px', height: '55px' }} />
              </div>
            </div>
            {/* Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                fontSize: '9px',
                color: '#888',
                fontWeight: 400,
                letterSpacing: '0.5px',
                borderTop: '1px solid #eee',
                paddingTop: '8px',
              }}
            >
              <span>Member since {new Date().toLocaleDateString()}</span>
              <span>Powered by Verxio Protocol</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export async function createImageLoyaltyPass(data: LoyaltyPassData): Promise<Buffer> {
  const generator = new CreateImageLoyaltyPass({ data })
  return (await generator.build({ format: 'png' })) as Buffer
}
