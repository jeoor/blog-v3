<script setup lang="ts">
import { createPlainShiki } from 'plain-shiki'
import { getShikiOptions } from '~/shiki.config'

const props = withDefaults(defineProps<{
	prompt?: string | boolean
	code?: string
	lang?: string
}>(), {
	prompt: '$',
})

// prompt 传入空字符串会变成 true
const showPrompt = computed(() => props.prompt !== true)
const language = computed(() => props.lang ?? getPromptLanguage(props.prompt))
const showUndo = ref(false)
const codeInput = useTemplateRef('code-input')
const highlightLayer = useTemplateRef('highlight-layer')
const editableCode = ref(props.code ?? '')
const rawHtml = ref(escapeHtml(editableCode.value))
const useHtmlFallback = ref(false)
let plainShikiDispose: (() => boolean) | undefined

const { copy, copied } = useCopy(codeInput)

function supportsPlainShiki() {
	if (!import.meta.client)
		return false

	const runtimeWindow = window as Window & {
		CSS?: { highlights?: { keys: () => IterableIterator<unknown> } }
		Highlight?: unknown
	}

	return typeof CSSStyleSheet !== 'undefined'
		&& typeof runtimeWindow.CSS !== 'undefined'
		&& typeof runtimeWindow.CSS.highlights !== 'undefined'
		&& typeof runtimeWindow.Highlight !== 'undefined'
		&& 'adoptedStyleSheets' in document
}

function prefersHtmlFallback() {
	if (!import.meta.client)
		return false

	const runtimeNavigator = navigator as Navigator & {
		userAgentData?: {
			brands?: Array<{ brand: string }>
		}
	}
	const browserBrands = (runtimeNavigator.userAgentData?.brands ?? [])
		.map(brand => brand.brand)
		.join(' ')
		?? ''
	const browserSignature = `${browserBrands} ${runtimeNavigator.userAgent}`

	return /\b(?:Chromium|Chrome|Edg|OPR|Opera|Brave)\b/i.test(browserSignature)
}

async function refreshHighlightedHtml(code = editableCode.value) {
	const { highlightInlineCode } = await import('~/utils/codeHighlight.shared')
	rawHtml.value = await highlightInlineCode(code, language.value)
}

async function enableHtmlFallback() {
	plainShikiDispose?.()
	plainShikiDispose = undefined
	useHtmlFallback.value = true
	await refreshHighlightedHtml(editableCode.value)
	syncScroll()
}

function syncScroll() {
	if (!useHtmlFallback.value || !codeInput.value || !highlightLayer.value)
		return

	highlightLayer.value.scrollLeft = codeInput.value.scrollLeft
	highlightLayer.value.scrollTop = codeInput.value.scrollTop
}

function undo() {
	if (!codeInput.value)
		return

	editableCode.value = props.code ?? ''
	codeInput.value.textContent = props.code ?? ''
	showUndo.value = false

	if (useHtmlFallback.value) {
		void refreshHighlightedHtml(editableCode.value)
		syncScroll()
		return
	}

	// 触发 shiki 高亮
	codeInput.value.dispatchEvent(new Event('input'))
}

function preventLineBreak(event: InputEvent) {
	const { data, inputType } = event
	if (data?.includes('\n') || inputType === 'insertLineBreak') {
		event.preventDefault()
	}
}

function checkUndoable(event: InputEvent) {
	editableCode.value = (event.target as Element).textContent ?? ''
	showUndo.value = props.code !== editableCode.value

	if (useHtmlFallback.value) {
		void refreshHighlightedHtml(editableCode.value)
		syncScroll()
	}
}

onMounted(async () => {
	if (!supportsPlainShiki() || prefersHtmlFallback()) {
		await enableHtmlFallback()
		return
	}

	try {
		const { getEditableCodeHighlightContext } = await import('~/utils/codeHighlight.shared')
		const { highlighter, language: shikiLanguage } = await getEditableCodeHighlightContext(language.value)

		plainShikiDispose = createPlainShiki(highlighter).mount(
			codeInput.value!,
			getShikiOptions(shikiLanguage),
		).dispose

		const runtimeWindow = window as Window & {
			CSS?: { highlights?: { keys: () => IterableIterator<unknown> } }
		}
		const hasShikiHighlights = Array.from(runtimeWindow.CSS?.highlights?.keys?.() ?? [])
			.some(name => String(name).startsWith('shiki-'))

		if (!hasShikiHighlights)
			await enableHtmlFallback()
	}
	catch {
		await enableHtmlFallback()
	}
})

onBeforeUnmount(() => {
	plainShikiDispose?.()
})

</script>

<template>
<code class="copy" :class="{ 'is-html-fallback': useHtmlFallback }">
	<span v-if="showPrompt" class="prompt">{{ prompt }}</span>

	<div class="code-shell">
		<div
			ref="highlight-layer"
			v-show="useHtmlFallback"
			class="code-preview scrollcheck-x shiki"
			aria-hidden="true"
			v-html="rawHtml"
		/>

		<div
			ref="code-input"
			contenteditable="plaintext-only"
			class="code scrollcheck-x"
			spellcheck="false"
			@beforeinput="preventLineBreak"
			@input="checkUndoable"
			@scroll="syncScroll"
			v-text="editableCode"
		/>
	</div>

	<button v-if="showUndo" class="operation" aria-label="恢复原始内容" @click="undo">
		<Icon name="ph:arrow-u-up-left-bold" />
	</button>

	<button class="operation" aria-label="复制" @click="copy()">
		<Icon :name="copied ? 'ph:check-bold' : 'ph:copy-bold'" />
	</button>
</code>
</template>

<style lang="scss" scoped>
.copy {
	contain: paint;
	display: flex;
	overflow: auto; // prompt 溢出时滚动
	margin: 0.5rem 0;
	border: 1px solid var(--c-border);
	border-radius: 4px;
	background-color: var(--ld-bg-card);
	font-size: 0.8rem;
	line-height: 2.5;
	transition: border-color 0.2s;

	&:focus-within {
		border-color: var(--c-primary);
		outline: 0.2em solid var(--c-primary-soft);

		.prompt {
			border-inline-end-color: var(--c-primary);
			background-color: var(--c-primary-soft);
			color: var(--c-primary);
		}
	}

	.prompt {
		flex-shrink: 0;
		padding: 0 1em;
		border-inline-end: 1px solid var(--c-border);
		background-color: var(--c-bg-2);
		color: var(--c-text-2);
		transition: all 0.2s;
	}

	.code-shell {
		flex-grow: 1;
		min-width: 0;
	}

	.code {
		--fadeout-width: 3ch;
		--scrollbar-height: 4px;

		flex-grow: 1;
		overflow: auto;
		padding: 0 1em;
		font-family: var(--font-monospace);
		outline: none;
		white-space: nowrap;
		scrollbar-color: auto;
		scrollbar-width: auto;

		&::-webkit-scrollbar {
			height: 4px;
			background-color: transparent;
		}
	}

	.code-preview {
		display: none;
	}

	&.is-html-fallback {
		overflow: hidden;

		.code-shell {
			position: relative;
			overflow: hidden;
		}

		.code-preview,
		.code {
			box-sizing: border-box;
			min-height: 2.5em;
			line-height: 2.5;
		}

		.code-preview {
			display: block;
			overflow: hidden;
			padding: 0 1em;
			pointer-events: none;
			user-select: none;
			white-space: nowrap;

			:deep(pre) {
				margin: 0;
				padding: 0;
				background-color: transparent !important;
				line-height: inherit;
			}

			:deep(code) {
				line-height: inherit;
			}
		}

		.code {
			position: absolute;
			inset: 0;
			background-color: transparent;
			color: transparent;
			caret-color: var(--c-text-1);
			-webkit-text-fill-color: transparent;

			&::selection {
				background-color: var(--c-primary-soft);
				color: transparent;
			}
		}
	}

	.operation {
		flex-shrink: 0;
		height: 2.5em;
		margin-inline-start: -0.5em;
		padding: 0.5em;
		color: var(--c-text-2);
		transition: color, 0.2s;

		&:hover {
			color: var(--c-primary);
		}
	}
}
</style>
