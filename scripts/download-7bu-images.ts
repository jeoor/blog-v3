import { Buffer } from 'node:buffer'
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

interface Options {
	baseUrl: string
	rootDir: string
	outDir: string
	urlFile?: string
	timeoutSec: number
	force: boolean
	dryRun: boolean
}

const DEFAULT_BASE_URL = 'https://bu.dusays.com'
const DEFAULT_OUT_DIR = path.join('public', 'images', '7bu')

const scannableExtensions = new Set([
	'.css',
	'.html',
	'.js',
	'.json',
	'.jsx',
	'.md',
	'.mdc',
	'.scss',
	'.ts',
	'.tsx',
	'.vue',
	'.yaml',
	'.yml',
])

const excludedDirectories = new Set([
	'.git',
	'.claude',
	'.data',
	'.edgeone',
	'.netlify',
	'.nuxt',
	'.output',
	'.tef_dist',
	'.vercel',
	'dist',
	'node_modules',
])

function printHelp() {
	console.log(`
Download 7bu images referenced by this project.

Usage:
  pnpm download:7bu [options]

Options:
  --dry-run              Scan and print target paths without downloading
  --force                Redownload images even when local files exist
  --url-file <path>      Read URLs from a file instead of scanning the project
  --root-dir <path>      Project root to scan, defaults to current directory
  --out-dir <path>       Output directory, defaults to public/images/7bu
  --base-url <url>       Image host, defaults to https://bu.dusays.com
  --timeout <seconds>    Per-image download timeout, defaults to 30
  -h, --help             Show help
`.trim())
}

function readArg(args: string[], index: number, name: string) {
	const value = args[index + 1]
	if (!value || value.startsWith('--'))
		throw new Error(`Missing value for ${name}`)

	return value
}

function parseOptions(): Options {
	const args = process.argv.slice(2)
	const options: Options = {
		baseUrl: DEFAULT_BASE_URL,
		rootDir: process.cwd(),
		outDir: path.resolve(process.cwd(), DEFAULT_OUT_DIR),
		timeoutSec: 30,
		force: false,
		dryRun: false,
	}

	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i]

		switch (arg) {
			case '-h':
			case '--help':
				printHelp()
				process.exit(0)
				break
			case '--dry-run':
				options.dryRun = true
				break
			case '--force':
				options.force = true
				break
			case '--url-file':
				options.urlFile = path.resolve(readArg(args, i, arg))
				i += 1
				break
			case '--root-dir':
				options.rootDir = path.resolve(readArg(args, i, arg))
				i += 1
				break
			case '--out-dir':
				options.outDir = path.resolve(readArg(args, i, arg))
				i += 1
				break
			case '--base-url':
				options.baseUrl = readArg(args, i, arg).replace(/\/+$/, '')
				i += 1
				break
			case '--timeout':
				options.timeoutSec = Number(readArg(args, i, arg))
				if (!Number.isFinite(options.timeoutSec) || options.timeoutSec <= 0)
					throw new Error(`Invalid timeout: ${args[i + 1]}`)

				i += 1
				break
			default:
				throw new Error(`Unknown option: ${arg}`)
		}
	}

	options.rootDir = path.resolve(options.rootDir)
	options.outDir = path.resolve(options.outDir)

	return options
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
}

function isSameOrChildPath(parent: string, child: string) {
	const relative = path.relative(parent, child)
	return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

async function collectScannableFiles(rootDir: string, outDir: string) {
	const files: string[] = []

	async function visit(dir: string) {
		for (const entry of await readdir(dir, { withFileTypes: true })) {
			const fullPath = path.join(dir, entry.name)

			if (entry.isDirectory()) {
				if (excludedDirectories.has(entry.name))
					continue
				if (isSameOrChildPath(outDir, fullPath))
					continue

				await visit(fullPath)
				continue
			}

			if (entry.isFile() && scannableExtensions.has(path.extname(entry.name)))
				files.push(fullPath)
		}
	}

	await visit(rootDir)

	return files
}

function extractImageUrls(text: string, baseUrl: string) {
	const imageUrlPattern = new RegExp(
		`${escapeRegExp(baseUrl)}/[^\\s'"<>)\\]}]+\\.(?:avif|gif|jpe?g|png|svg|webp)(?:\\?[^\\s'"<>)\\]}]+)?`,
		'giu',
	)

	return Array.from(text.matchAll(imageUrlPattern), match => match[0].replace(/[.,;:]+$/u, ''))
}

async function getImageUrls(options: Options) {
	if (options.urlFile) {
		console.log(`Reading 7bu image URLs from ${options.urlFile}`)
		const text = await readFile(options.urlFile, 'utf-8')
		return extractImageUrls(text, options.baseUrl)
	}

	console.log(`Scanning project files under ${options.rootDir}`)
	const files = await collectScannableFiles(options.rootDir, options.outDir)
	console.log(`Scanned ${files.length} source files`)

	const urls: string[] = []
	for (const file of files) {
		try {
			urls.push(...extractImageUrls(await readFile(file, 'utf-8'), options.baseUrl))
		}
		catch (error) {
			console.warn(`Skipping ${file}: ${error instanceof Error ? error.message : String(error)}`)
		}
	}

	return urls
}

function getLocalImagePath(url: string, options: Options) {
	const parsedUrl = new URL(url)
	const baseUrl = new URL(options.baseUrl)

	if (parsedUrl.protocol !== 'https:' || parsedUrl.host !== baseUrl.host)
		throw new Error(`Unexpected URL host: ${url}`)

	const relativePath = decodeURIComponent(parsedUrl.pathname).replace(/^\/+/u, '')
	const parts = relativePath.split('/').filter(Boolean)
	if (!parts.length || parts.includes('..'))
		throw new Error(`Unsafe URL path: ${url}`)

	const localPath = path.resolve(options.outDir, ...parts)
	if (!isSameOrChildPath(options.outDir, localPath))
		throw new Error(`Resolved path escapes output directory: ${url}`)

	return {
		relativePath: `/${parts.join('/')}`,
		localPath,
	}
}

function formatSize(size: number) {
	return `${Math.round((size / 1024) * 10) / 10}KB`
}

async function getExistingFileSize(filePath: string) {
	try {
		const fileStat = await stat(filePath)
		return fileStat.isFile() ? fileStat.size : null
	}
	catch {
		return null
	}
}

async function downloadFile(url: string, filePath: string, timeoutSec: number) {
	const controller = new AbortController()
	const timeout = setTimeout(() => controller.abort(), timeoutSec * 1000)
	const tempPath = `${filePath}.download`

	try {
		await rm(tempPath, { force: true })

		const response = await fetch(url, { signal: controller.signal })
		if (!response.ok)
			throw new Error(`HTTP ${response.status} ${response.statusText}`)

		const buffer = Buffer.from(await response.arrayBuffer())
		if (buffer.length === 0)
			throw new Error('Downloaded empty file')

		await mkdir(path.dirname(filePath), { recursive: true })
		await writeFile(tempPath, buffer)
		await rename(tempPath, filePath)

		return buffer.length
	}
	catch (error) {
		await rm(tempPath, { force: true }).catch(() => {})
		throw error
	}
	finally {
		clearTimeout(timeout)
	}
}

async function main() {
	const options = parseOptions()
	const urls = await getImageUrls(options)
	const uniqueUrls = Array.from(new Set(urls)).sort()

	console.log(`Found ${uniqueUrls.length} unique 7bu image URLs`)

	let successCount = 0
	let failCount = 0
	let skipCount = 0

	for (let i = 0; i < uniqueUrls.length; i += 1) {
		const url = uniqueUrls[i]!
		const progress = `[${i + 1}/${uniqueUrls.length}]`

		try {
			const { localPath, relativePath } = getLocalImagePath(url, options)
			const existingSize = await getExistingFileSize(localPath)

			if (existingSize && existingSize > 0 && !options.force) {
				console.log(`${progress} SKIP  ${relativePath} (${formatSize(existingSize)} exists)`)
				skipCount += 1
				continue
			}

			if (options.dryRun) {
				console.log(`${progress} DRY   ${relativePath} -> ${localPath}`)
				continue
			}

			const size = await downloadFile(url, localPath, options.timeoutSec)
			console.log(`${progress} OK    ${relativePath} (${formatSize(size)})`)
			successCount += 1
		}
		catch (error) {
			console.error(`${progress} FAIL  ${url} - ${error instanceof Error ? error.message : String(error)}`)
			failCount += 1
		}
	}

	console.log('')
	console.log('=== Download Complete ===')
	console.log(`Success: ${successCount}`)
	console.log(`Skipped: ${skipCount}`)
	console.log(`Failed:  ${failCount}`)
	console.log(`Total:   ${uniqueUrls.length}`)
	console.log(`Output:  ${options.outDir}`)

	if (failCount > 0)
		process.exit(1)
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error))
	process.exit(1)
})
