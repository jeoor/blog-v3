import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine-javascript.mjs'
import shikiConfig, { getShikiOptions } from '~/shiki.config'
import { getShikiLanguageLoader } from './shikiLanguageLoaders.shared'

type TransformerOption =
	| 'ignoreColorizedBrackets'
	| 'ignoreRenderWhitespace'
	| 'ignoreRenderIndentGuides'

interface HighlightCodeBlockOptions {
	code: string
	language?: string
	enableIndentGuide?: boolean
	indent?: number
}

interface LoadedTheme {
	name?: string
	[key: string]: unknown
}

interface ThemeState {
	themes: any[]
	themeNames: Record<string, string>
}

interface EditableCodeHighlightContext {
	highlighter: any
	language: string
}

const fallbackLanguage = 'plaintext'

let highlighterPromise: Promise<any> | undefined
let themeStatePromise: Promise<ThemeState> | undefined
const loadedLanguages = new Set<string>()

const languageAliases: Record<string, string> = {
	plain: fallbackLanguage,
	plaintext: fallbackLanguage,
	text: fallbackLanguage,
	txt: fallbackLanguage,
	console: 'bash',
	shell: 'bash',
	sh: 'bash',
	zsh: 'bash',
	md: 'markdown',
	mdc: 'markdown',
	yml: 'yaml',
}

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;')
}

function normalizeLanguage(language?: string) {
	const normalized = language?.trim().toLowerCase()
	if (!normalized)
		return fallbackLanguage

	return languageAliases[normalized] || normalized
}

function resolveTheme(themeModule: any): LoadedTheme {
	return (themeModule?.default ?? themeModule) as LoadedTheme
}

async function getThemeState() {
	themeStatePromise ??= (async () => {
		const themeEntries = Object.entries(shikiConfig.themes ?? {})
		const loadedThemeModules = await Promise.all(themeEntries.map(([, loadTheme]) => loadTheme()))
		const themes = loadedThemeModules.map(themeModule => resolveTheme(themeModule))
		const themeNames = Object.fromEntries(
			themeEntries.flatMap(([key], index) => {
				const themeName = themes[index]?.name
				return themeName ? [[key, themeName]] : []
			}),
		)

		return {
			themes,
			themeNames,
		}
	})()

	return themeStatePromise
}

async function getHighlighter() {
	highlighterPromise ??= (async () => {
		const { themes } = await getThemeState()

		return createHighlighterCore({
			engine: createJavaScriptRegexEngine(),
			themes,
		})
	})()

	return highlighterPromise
}

async function ensureLanguageLoaded(language: string) {
	if ([fallbackLanguage, 'text'].includes(language))
		return true

	if (loadedLanguages.has(language))
		return true

	const loadLanguage = await getShikiLanguageLoader(language)
	if (!loadLanguage)
		return false

	try {
		const highlighter = await getHighlighter()
		await highlighter.loadLanguage(await loadLanguage())
		loadedLanguages.add(language)
		return true
	}
	catch {
		return false
	}
}

async function renderHighlightedHtml(code: string, language: string, transformerOptions: TransformerOption[]) {
	const highlighter = await getHighlighter()
	const { themeNames } = await getThemeState()

	for (const candidate of [language, fallbackLanguage]) {
		if (!await ensureLanguageLoaded(candidate))
			continue

		try {
			const shikiOptions = getShikiOptions(candidate, transformerOptions) as unknown as Record<string, unknown>
			shikiOptions.themes = themeNames

			return await highlighter.codeToHtml(code, shikiOptions)
		}
		catch {
			continue
		}
	}

	return escapeHtml(code)
}
export async function highlightInlineCode(code: string, language?: string) {
	return renderHighlightedHtml(code, normalizeLanguage(language), [
		'ignoreColorizedBrackets',
		'ignoreRenderWhitespace',
		'ignoreRenderIndentGuides',
	])
}

export async function getEditableCodeHighlightContext(language?: string): Promise<EditableCodeHighlightContext> {
	const normalizedLanguage = normalizeLanguage(language)
	const resolvedLanguage = await ensureLanguageLoaded(normalizedLanguage)
		? normalizedLanguage
		: fallbackLanguage

	return {
		highlighter: await getHighlighter(),
		language: resolvedLanguage,
	}
}

export async function highlightCodeBlock(options: HighlightCodeBlockOptions) {
	const transformerOptions: TransformerOption[] = []

	if (options.enableIndentGuide === false)
		transformerOptions.push('ignoreRenderIndentGuides')

	return renderHighlightedHtml(options.code, normalizeLanguage(options.language), transformerOptions)
}