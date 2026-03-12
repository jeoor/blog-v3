<script setup lang="ts">
const props = withDefaults(defineProps<{
	prompt?: string
	code?: string
}>(), {
	prompt: '$',
	code: '',
})

const { copy, copied } = useCopy(props.code)
</script>

<template>
<div class="link-copy-field">
	<span class="prompt">{{ prompt }}</span>
	<span class="code">{{ code }}</span>
	<button class="operation" :aria-label="copied ? '已复制' : '复制'" @click="copy()">
		<Icon :name="copied ? 'ph:check-bold' : 'ph:copy-bold'" />
	</button>
</div>
</template>

<style lang="scss" scoped>
.link-copy-field {
	display: grid;
	grid-template-columns: auto minmax(0, 1fr) auto;
	align-items: center;
	gap: 0.75rem;
	margin: 0.6rem 0;
	padding: 0.75rem 0.9rem;
	border: 1px solid var(--c-border);
	border-radius: 0.6rem;
	background:
		linear-gradient(135deg, color-mix(in srgb, var(--c-bg-2) 92%, var(--c-primary-soft) 8%), var(--c-bg-2));

	.prompt {
		padding: 0.2rem 0.65rem;
		border-radius: 999px;
		background-color: var(--c-bg-3, var(--c-bg-2));
		color: var(--c-text-2);
		font-size: 0.86rem;
		white-space: nowrap;
	}

	.code {
		min-width: 0;
		color: var(--c-text-1);
		font-family: var(--font-monospace);
		font-size: 0.92rem;
		line-height: 1.6;
		word-break: break-all;
	}

	.operation {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.2rem;
		height: 2.2rem;
		border-radius: 999px;
		background-color: var(--c-bg-2);
		color: var(--c-text-2);
		transition:
			color 0.2s,
			background-color 0.2s,
			transform 0.2s;

		&:hover {
			background-color: var(--c-primary-soft);
			color: var(--c-primary);
		}

		&:active {
			transform: scale(0.96);
		}
	}
}

@media (max-width: $breakpoint-phone) {
	.link-copy-field {
		grid-template-columns: 1fr auto;

		.prompt {
			grid-column: 1 / 2;
			justify-self: start;
		}

		.code {
			grid-column: 1 / 2;
		}

		.operation {
			grid-column: 2 / 3;
			grid-row: 1 / span 2;
		}
	}
}
</style>