import { Builder, Font, FontFactory } from 'canvacord'
import QRCode from 'qrcode'
import { formatNumber } from '../utils'

interface LoyaltyProgramData {
  name: string
  collectionAddress: string
  numMinted: number
  tiers: Array<{
    name: string
    xpRequired: number
    rewards: string[]
  }>
  pointsPerAction: {
    [key: string]: number
  }
  metadata: {
    organizationName: string
    brandColor?: string
    qrCodeUrl?: string
  }
  creator: string
}

class CreateImageLoyaltyProgram extends Builder {
  constructor(
    private readonly vars: {
      data: LoyaltyProgramData
    },
  ) {
    super(500, 500)
    if (!FontFactory.size) Font.loadDefault()
  }

  private getGradientColors(brandColor: string): string[] {
    const r = parseInt(brandColor.slice(1, 3), 16)
    const g = parseInt(brandColor.slice(3, 5), 16)
    const b = parseInt(brandColor.slice(5, 7), 16)

    const lighter = `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`
    const darker = `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`

    return [lighter, brandColor, darker]
  }

  async render() {
    const { data } = this.vars
    const colors = this.getGradientColors(data.metadata.brandColor || '#8aec25')
    const qrCodeUrl = data.metadata.qrCodeUrl || `https://verxio.xyz/program/${data.collectionAddress}`
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
          width: '500px',
          height: '500px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e6e9f0 100%)',
          borderRadius: '20px',
          padding: '20px',
          color: '#222',
          fontFamily: 'Arial, sans-serif',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
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
            opacity: 0.08,
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
              marginBottom: '14px',
              width: '100%',
            }}
          >
            {/* Program Name and Organization */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span
                style={{
                  fontFamily: 'Press Start 2P',
                  margin: '0 0 6px 0',
                  fontSize: '22px',
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
                  fontSize: '13px',
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
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 600,
                boxShadow: `0 4px 10px ${colors[1]}22`,
              }}
            >
              {formatNumber(data.numMinted)} Members
            </div>
          </div>

          {/* Creator and Collection Address */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              background: 'rgba(240,240,255,0.7)',
              borderRadius: '10px',
              padding: '10px 12px',
              marginBottom: '14px',
              border: `1px solid ${colors[1]}22`,
              boxShadow: '0 1px 4px #0001',
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
              <b style={{ color: colors[1], fontWeight: 700 }}>Creator: </b> {data.creator}
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
              <b style={{ color: colors[1], fontWeight: 700 }}>Collection: </b> {data.collectionAddress}
            </span>
          </div>

          {/* Divider */}
          <div
            style={{ width: '100%', height: '1px', background: '#e0e0e0', margin: '0 0 14px 0', borderRadius: '1px' }}
          />

          {/* Points System */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '14px',
              width: '100%',
            }}
          >
            <h3 style={{ fontSize: '14px', margin: '0 0 8px 0', color: colors[1], fontWeight: 700 }}>Points System</h3>
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              {Object.entries(data.pointsPerAction).map(([action, points]) => (
                <div
                  key={action}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#fff',
                    padding: '10px',
                    borderRadius: '10px',
                    flex: 1,
                    boxShadow: '0 2px 8px #0001',
                    border: `1px solid ${colors[0]}`,
                  }}
                >
                  <span style={{ fontSize: '12px', textTransform: 'capitalize', color: '#666', fontWeight: 500 }}>
                    {action}
                  </span>
                  <span
                    style={{ fontSize: '16px', fontWeight: 'bold', color: colors[1], fontFamily: 'Press Start 2P' }}
                  >
                    {points} XP
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{ width: '100%', height: '1px', background: '#e0e0e0', margin: '0 0 14px 0', borderRadius: '1px' }}
          />

          {/* Tiers */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
            }}
          >
            <h3 style={{ fontSize: '14px', margin: '0 0 8px 0', color: colors[1], fontWeight: 700 }}>Reward Tiers</h3>
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              {data.tiers.map((tier) => (
                <div
                  key={tier.name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#fff',
                    padding: '10px',
                    borderRadius: '10px',
                    flex: 1,
                    boxShadow: '0 2px 8px #0001',
                    border: `1px solid ${colors[0]}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                      width: '100%',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: colors[1] }}>{tier.name}</span>
                    <span style={{ fontSize: '11px', color: '#666' }}>{tier.xpRequired} XP</span>
                  </div>
                  <ul
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      margin: 0,
                      padding: '0 0 0 14px',
                      fontSize: '11px',
                      color: '#666',
                      width: '100%',
                    }}
                  >
                    {tier.rewards.map((reward, i) => (
                      <li
                        key={i}
                        style={{
                          marginBottom: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ color: colors[1] }}>•</span>
                        {reward}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

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
                <span style={{ fontSize: '12px', color: '#888', fontWeight: 500 }}>Scan to join loyalty program</span>
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
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                fontSize: '9px',
                color: '#888',
                fontWeight: 400,
                letterSpacing: '0.5px',
              }}
            >
              <span>Powered by Verxio Protocol</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export async function createImageLoyaltyProgram(data: LoyaltyProgramData): Promise<Buffer> {
  const generator = new CreateImageLoyaltyProgram({ data })
  return (await generator.build({ format: 'png' })) as Buffer
}
