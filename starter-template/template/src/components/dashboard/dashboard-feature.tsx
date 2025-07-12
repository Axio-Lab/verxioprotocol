import { AppHero } from '@/components/app-hero'

const links: { label: string; href: string }[] = [
  { label: 'Verxio Docs', href: 'https://docs.verxio.xyz/' },
  { label: 'Verxio Twitter', href: 'https://x.com/verxioprotocol' },
  { label: 'Verxio UI Library', href: 'https://ui.verxio.xyz/' },
  { label: 'Verxio Developers GitHub', href: 'https://github.com/Axio-Lab/' },
]

export function DashboardFeature() {
  return (
    <div>
      <AppHero title="gm" subtitle="Say hi to your new Verxio powered app." />
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        <div className="space-y-2">
          <p>Here are some helpful links to get you started.</p>
          {links.map((link, index) => (
            <div key={index}>
              <a
                href={link.href}
                className="hover:text-gray-500 dark:hover:text-gray-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
