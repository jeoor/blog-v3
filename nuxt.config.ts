import type { NitroConfig } from 'nitropack'
import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { arch, env, version as nodeVersion, platform } from 'node:process'
import { name as ciName, CLOUDFLARE_PAGES, GITHUB_ACTIONS, NETLIFY } from 'ci-info'
import { imageSize } from 'image-size'
import { pascal } from 'radash'
import { Temporal } from 'temporal-polyfill'
import blogConfig from './blog.config'
import packageJson from './package.json'
import redirectList from './redirects.json'

const edgeOneEnvKeyRE = /^(?:EDGEONE|EO_|TENCENTCLOUD)/i
const lineBreakRE = /\r?\n/u
const edgeOneDetected = env.TENCENTCLOUD_RUNENV === 'SCF'
	|| Object.keys(env).some(key => edgeOneEnvKeyRE.test(key))
const runtimeCi = env.BLOG_CI || env.CI_NAME || (edgeOneDetected ? 'EdgeOne' : ciName || '')
const nitroOutputDir = env.BLOG_NITRO_OUTPUT_DIR?.trim()
const nitroOutput = nitroOutputDir
	? {
			dir: resolve(nitroOutputDir),
			publicDir: join(resolve(nitroOutputDir), 'public'),
			serverDir: join(resolve(nitroOutputDir), 'server'),
		}
	: undefined
const workspaceCatalogSource = readFileSync(resolve('pnpm-workspace.yaml'), 'utf8')
const workspaceCatalogLines = workspaceCatalogSource.split(lineBreakRE)
const versionPrefixRE = /^[~^<>=\s]+/
const wrappingQuotesRE = /^['"]|['"]$/g
const leadingWhitespaceRE = /^\s*/u
const httpUrlRE = /^https?:\/\//
const queryOrHashRE = /[?#].*$/
const postsPrefixRE = /^\/posts/

function getWorkspaceCatalogVersion(packageName: string) {
	const directKey = `${packageName}:`
	const singleQuotedKey = `'${packageName}':`
	const doubleQuotedKey = `"${packageName}":`

	for (const line of workspaceCatalogLines) {
		if (!line.startsWith('    '))
			continue

		const trimmedLine = line.trimStart()
		if (!trimmedLine.startsWith(directKey) && !trimmedLine.startsWith(singleQuotedKey) && !trimmedLine.startsWith(doubleQuotedKey))
			continue

		const separatorIndex = trimmedLine.indexOf(':')
		if (separatorIndex === -1)
			return ''

		return trimmedLine.slice(separatorIndex + 1).trim().replace(versionPrefixRE, '')
	}

	return ''
}

const techstackVersions = {
	vue: getWorkspaceCatalogVersion('vue'),
	nuxt: getWorkspaceCatalogVersion('nuxt'),
	content: getWorkspaceCatalogVersion('@nuxt/content'),
}

const picBlockRegex = /::pic\s*---\n([\s\S]*?)\n---\s*::/g
const imageDimensionCache = new Map<string, Promise<{ width: number, height: number } | null>>()

function getPicProp(block: string, key: string) {
	for (const line of block.split(lineBreakRE)) {
		const trimmedLine = line.trimStart()
		if (!trimmedLine.startsWith(`${key}:`))
			continue

		return trimmedLine.slice(key.length + 1).trim().replace(wrappingQuotesRE, '')
	}

	return ''
}

function getPicNumericProp(block: string, key: string) {
	const value = Number(getPicProp(block, key))
	return Number.isFinite(value) && value > 0 ? value : undefined
}

function setPicProp(block: string, key: string, value: number) {
	const lines = block.split(lineBreakRE)
	const existingLine = lines.find(entry => entry.trimStart().startsWith(`${key}:`))
	const anchorKey = key === 'width' ? 'height' : 'width'
	const anchorLine = lines.find(entry => entry.trimStart().startsWith(`${anchorKey}:`))
	const lineIndent = (existingLine || anchorLine)?.match(leadingWhitespaceRE)?.[0] || ''
	const line = `${lineIndent}${key}: ${value}`
	const existingIndex = lines.findIndex(entry => entry.trimStart().startsWith(`${key}:`))

	if (existingIndex !== -1) {
		lines[existingIndex] = line
		return lines.join('\n')
	}

	const anchorIndex = lines.findIndex(entry => entry.trimStart().startsWith(`${anchorKey}:`))

	if (anchorIndex !== -1) {
		lines.splice(anchorIndex, 0, line)
		return lines.join('\n')
	}

	return `${block.trimEnd()}\n${line}`
}

function normalizePicBlock(block: string) {
	return block
		.split(lineBreakRE)
		.map((line) => {
			const keyIndex = line.indexOf('weight:')
			if (keyIndex === -1 || line.slice(0, keyIndex).trim().length > 0)
				return line

			return `${line.slice(0, keyIndex)}width:${line.slice(keyIndex + 'weight:'.length)}`
		})
		.join('\n')
}

async function getImageDimensions(src: string, filePath: string) {
	const cacheKey = `${filePath}::${src}`
	if (!imageDimensionCache.has(cacheKey)) {
		imageDimensionCache.set(cacheKey, (async () => {
			try {
				if (httpUrlRE.test(src)) {
					const response = await fetch(src)
					if (!response.ok)
						return null

					const buffer = Buffer.from(await response.arrayBuffer())
					const size = imageSize(buffer)
					return size.width && size.height ? { width: size.width, height: size.height } : null
				}

				const normalizedSrc = src.replace(queryOrHashRE, '')
				const localPath = normalizedSrc.startsWith('/')
					? resolve(process.cwd(), 'public', `.${normalizedSrc}`)
					: resolve(process.cwd(), dirname(filePath), normalizedSrc)

				const buffer = await readFile(localPath)
				const size = imageSize(buffer)
				return size.width && size.height ? { width: size.width, height: size.height } : null
			}
			catch {
				return null
			}
		})())
	}

	return imageDimensionCache.get(cacheKey)!
}

async function fillMissingPicDimensions(body: string, filePath: string) {
	const matches = [...body.matchAll(picBlockRegex)]
	if (!matches.length)
		return body

	let result = ''
	let lastIndex = 0

	for (const match of matches) {
		const [fullMatch, rawBlock = ''] = match
		const startIndex = match.index ?? 0
		const block = normalizePicBlock(rawBlock)
		const src = getPicProp(block, 'src')
		const width = getPicNumericProp(block, 'width')
		const height = getPicNumericProp(block, 'height')

		let nextBlock = block
		if (src && (!width || !height)) {
			const intrinsicSize = await getImageDimensions(src, filePath)
			if (intrinsicSize?.width && intrinsicSize?.height) {
				if (!width && height) {
					nextBlock = setPicProp(nextBlock, 'width', Math.round(height * intrinsicSize.width / intrinsicSize.height))
				}

				if (!height && width) {
					nextBlock = setPicProp(nextBlock, 'height', Math.round(width * intrinsicSize.height / intrinsicSize.width))
				}
			}
		}

		result += body.slice(lastIndex, startIndex)
		result += fullMatch.replace(block, nextBlock)
		lastIndex = startIndex + fullMatch.length
	}

	result += body.slice(lastIndex)
	return result
}

// 此处配置无需修改
export default defineNuxtConfig({
	app: {
		head: {
			meta: [
				{ name: 'author', content: [blogConfig.author.name, blogConfig.author.email].filter(Boolean).join(', ') },
				{ name: 'color-scheme', content: 'light dark' },
				// 此处为元数据的生成器标识，不建议修改
				{ 'name': 'generator', 'content': `${pascal(packageJson.name)} ${packageJson.version}`, 'data-github-repo': packageJson.homepage },
				{ name: 'mobile-web-app-capable', content: 'yes' },
			],
			link: [
				{ rel: 'preload', href: '/fonts/AlimamaFangYuanTi.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
				{ rel: 'icon', href: blogConfig.favicon },
				{ rel: 'alternate', type: 'application/atom+xml', href: '/atom.xml' },
				// "JetBrains Mono"
				{ rel: 'stylesheet', href: 'https://fonts.googleapis.cn/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap', media: 'print', onload: 'this.media="all"' },
			],
			templateParams: {
				separator: '|',
			},
			titleTemplate: `%s %separator ${blogConfig.title}`,
			script: blogConfig.scripts,
		},
		rootAttrs: {
			id: 'blog-root',
		},
	},

	compatibilityDate: '2024-08-03',

	components: [
		{ path: '~/components/partial', prefix: 'Z' },
		'~/components',
	],

	css: [
		'@/assets/css/animation.scss',
		'@/assets/css/article.scss',
		'@/assets/css/color.scss',
		'@/assets/css/font.scss',
		'@/assets/css/main.scss',
		'@/assets/css/reusable.scss',
	],

	// @keep-sorted
	experimental: {
		extractAsyncDataHandlers: true,
		typescriptPlugin: true,
	},

	features: {
		inlineStyles: true,
	},

	nitro: {
		output: nitroOutput,
		prerender: {
			// 修复部分平台会在文章路径后添加 `/`，导致闪现 404 错误
			// https://github.com/nuxt/content/issues/2378
			autoSubfolderIndex: CLOUDFLARE_PAGES || GITHUB_ACTIONS || NETLIFY ? false : undefined,
		},
	},

	// @keep-sorted
	routeRules: {
		...Object.entries(redirectList)
			.reduce<NitroConfig['routeRules']>((acc, [from, to]) => {
				acc![from] = { redirect: { to, statusCode: 308 } }
				return acc
			}, {}),
		'/api/stats': { prerender: true, headers: { 'Content-Type': 'application/json' } },
		'/atom.xml': { prerender: true, headers: { 'Content-Type': 'application/xml' } },
		'/favicon.ico': { redirect: { to: blogConfig.favicon } },
		'/zhilu.opml': { prerender: true, headers: { 'Content-Type': 'application/xml' } },
	},

	runtimeConfig: {
		// @keep-sorted
		public: {
			arch,
			buildTime: Temporal.Now.zonedDateTimeISO().toString(),
			ci: runtimeCi,
			nodeVersion,
			platform,
			techstackVersions,
		},
	},

	/** 在生产环境启用 sourcemap */
	// sourcemap: true,

	vite: {
		build: {
			chunkSizeWarningLimit: 900,
		},
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: '@use "@/assets/css/_variable.scss" as *;',
				},
			},
		},
		define: {
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: env.BLOG_DEBUG_HYDRATION === '1' ? 'true' : 'false',
			/** 在生产环境启用 Vue DevTools */
			// __VUE_PROD_DEVTOOLS__: 'true',
		},
		server: {
			allowedHosts: true,
		},
	},

	// @keep-sorted
	modules: [
		'@bikariya/image-viewer',
		'@bikariya/modals',
		'@bikariya/shiki',
		'@nuxt/a11y',
		'@nuxt/content',
		'@nuxt/hints',
		'@nuxt/icon',
		'@nuxt/image',
		'@nuxtjs/color-mode',
		'@nuxtjs/seo',
		'@pinia/nuxt',
		'@vueuse/nuxt',
		'nuxt-llms',
	],

	colorMode: {
		preference: 'system',
		fallback: 'light',
		classSuffix: '',
	},

	content: {
		build: {
			markdown: {
				highlight: false,
				// @keep-sorted
				remarkPlugins: {
					'remark-math': {},
					'remark-music': {},
					'remark-reading-time': {},
				},
				// @keep-sorted
				rehypePlugins: {
					'rehype-katex': {},
					'rehype-meta-slots': {},
				},
				toc: { depth: 4, searchDepth: 4 },
			},
		},
		experimental: {
			sqliteConnector: 'native',
		},
	},

	hooks: {
		'ready': () => {
			console.info(`
================================
${pascal(packageJson.name)} ${packageJson.version}
${packageJson.homepage}
================================
`)
		},
		'content:file:beforeParse': async (ctx) => {
			if (!['.md', '.mdc', '.mdx'].includes(ctx.file.extension || ''))
				return

			if (!ctx.file.body.includes('::pic'))
				return

			ctx.file.body = await fillMissingPicDimensions(ctx.file.body, ctx.file.path)
		},
		'content:file:afterParse': (ctx) => {
			const permalink = ctx.content.permalink as string
			if (permalink) {
				ctx.content.path = permalink
				return
			}
			// 在 URL 中隐藏文件路由自动生成的 /posts 路径前缀
			if (blogConfig.article.hidePostPrefix) {
				const realPath = ctx.content.path as string | undefined
				ctx.content.path = realPath?.replace(postsPrefixRE, '')
			}
		},
	},

	icon: {
		collections: [
			'line-md',
			'material-symbols',
			'ph',
			'ri',
			'simple-icons',
			'solar',
		],
		customCollections: [
			{ prefix: 'zi', dir: './app/assets/icons' },
		],
		clientBundle: {
			scan: false,
		},
	},

	image: {
		// 尽量以这些密度点对点显示
		densities: [1, 1.5, 2],
		format: ['avif', 'webp'],
		// Neylify 下 netlify 处理器无法显示站外图片，ipx 处理器无法显示站内图片，需彻底禁用
		// https://github.com/nuxt/image/issues/1353
		provider: NETLIFY ? 'none' : undefined,
	},

	linkChecker: {
		// @keep-sorted
		skipInspections: [
			'no-baseless',
			'no-non-ascii-chars',
			'no-uppercase-chars',
		],
	},

	llms: {
		domain: blogConfig.url,
		title: blogConfig.title,
		description: blogConfig.description,
	},

	ogImage: {
		enabled: false,
	},

	robots: {
		disableNuxtContentIntegration: true,
		disallow: blogConfig.article.robotsNotIndex,
	},

	sitemap: {
		zeroRuntime: true,
	},

	site: {
		name: blogConfig.title,
		url: blogConfig.url,
		defaultLocale: blogConfig.language,
	},
})
