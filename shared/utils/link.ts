import { fromUrl, parseDomain, ParseResultType } from 'parse-domain'
import { isPathFile } from 'site-config-stack/urls'

const githubUsernameRE = /github\.com\/([a-zA-Z0-9-]+)(?:\/[^/]+)?(\/?)$/
const trailingSlashRE = /\/+$/

const domainTip: Record<string, string> = {
	'github.io': 'GitHub Pages 域名',
	'netlify.app': 'Netlify 域名',
	'pages.dev': 'Cloudflare 域名',
	'thisis.host': '纸鹿提供的域名',
	'vercel.app': 'Vercel 域名',
	'zeabur.app': 'Zeabur 域名',
}

export function getDomain(url: string) {
	const domain = fromUrl(url)
	return typeof domain === 'symbol' ? url : domain
}

export function getMainDomain(url: string, useIcann?: boolean) {
	const hostname = getDomain(url)
	const parseResult = parseDomain(hostname)
	if (parseResult.type !== ParseResultType.Listed)
		return hostname
	const { domain, topLevelDomains } = useIcann ? parseResult.icann : parseResult
	return `${domain}.${topLevelDomains.join('.')}`
}

export function getDomainType(mainDomain: string) {
	return domainTip[mainDomain]
}

export function getGithubUsername(url?: string) {
	if (!url)
		return ''
	return url.match(githubUsernameRE)?.[1] ?? ''
}

export function isExtLink(url?: string) {
	return url
		? url.includes(':') || !!isPathFile(url)
		: false
}

export function toSiteRelativeLink(url: string, siteUrl: string) {
	if (!url)
		return url

	try {
		const targetUrl = new URL(url, siteUrl)
		const site = new URL(siteUrl)
		if (targetUrl.origin !== site.origin)
			return url

		const pathname = targetUrl.pathname === '/' ? '/' : targetUrl.pathname.replace(trailingSlashRE, '') || '/'
		return `${pathname}${targetUrl.search}${targetUrl.hash}`
	}
	catch {
		return url
	}
}

export function safelyDecodeUriComponent(str: string) {
	try {
		return decodeURIComponent(str)
	}
	catch {
		return str
	}
}
