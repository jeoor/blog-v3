<script setup lang="ts">
const props = defineProps<{
	language?: string
	code: string
}>()

function createHighlightStateKey(prefix: string, ...parts: Array<string | undefined>) {
	let hash = 2166136261
	let totalLength = 0

	for (const part of parts) {
		const value = part ?? ''
		totalLength += value.length

		for (let index = 0; index < value.length; index++) {
			hash ^= value.charCodeAt(index)
			hash = Math.imul(hash, 16777619)
		}

		hash ^= 31
		hash = Math.imul(hash, 16777619)
	}

	return `${prefix}:${totalLength}:${(hash >>> 0).toString(36)}`
}

const initialRawHtml = escapeHtml(props.code)
const rawHtml = useState<string>(
	createHighlightStateKey('code-highlight:inline', props.language, props.code),
	() => initialRawHtml,
)

if (props.language && rawHtml.value === initialRawHtml) {
	const { highlightInlineCode } = await import('~/utils/codeHighlight.shared')
	rawHtml.value = await highlightInlineCode(props.code, props.language)
}
</script>

<template>
<code v-if="language" class="shiki" v-html="rawHtml" />
<code v-else><slot>{{ code }}</slot></code>
</template>

<style lang="scss" scoped>
code {
	margin: 0.1em;
	padding: 0.1rem 0.3em;
	border: 1px solid var(--c-border);
	border-radius: 4px;
	background-color: var(--c-bg-2);
	font-size: 0.85em;
	white-space: break-spaces;

	@supports (color: color-mix(in srgb, transparent, transparent)) {
		border-color: color-mix(in srgb, currentcolor 10%, transparent);
		background-color: color-mix(in srgb, currentcolor 5%, transparent);
	}
}
</style>
