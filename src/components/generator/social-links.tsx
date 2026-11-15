import { GithubLogoIcon, InstagramLogoIcon, LinkedinLogoIcon } from '@phosphor-icons/react'

const LINKS = [
  { href: 'https://github.com/caseinn', icon: GithubLogoIcon, label: 'GitHub' },
  { href: 'https://instagram.com/ditorifkii', icon: InstagramLogoIcon, label: 'Instagram' },
  { href: 'https://linkedin.com/in/ditorifki', icon: LinkedinLogoIcon, label: 'LinkedIn' },
] as const

/** Author profile links shown in the header; they open in a new tab. */
export function SocialLinks() {
  return (
    <nav aria-label="Author profiles" className="flex items-center gap-0.5">
      {LINKS.map(({ href, icon: Icon, label }) => (
        <a
          aria-label={label}
          className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          href={href}
          key={label}
          rel="noreferrer"
          target="_blank"
        >
          <Icon className="size-4" />
        </a>
      ))}
    </nav>
  )
}
