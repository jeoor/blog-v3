<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const dropdownEl = useTemplateRef<HTMLElement>('dropdown')
const isOpen = ref(false)

function show() {
	isOpen.value = true
}

function hide() {
	isOpen.value = false
}

onClickOutside(dropdownEl, hide)

useEventListener(dropdownEl, 'focusout', () => {
	requestAnimationFrame(() => {
		if (!dropdownEl.value?.contains(document.activeElement))
			hide()
	})
})
</script>

<template>
<div ref="dropdown" class="dropdown" v-bind="attrs" @keydown.escape.stop="hide()">
	<div class="dropdown-trigger" @click="show()" @focusin="show()">
		<slot />
	</div>

	<Transition name="dropdown-fade">
		<div v-if="isOpen" class="dropdown-content">
			<slot name="content" :hide />
		</div>
	</Transition>
</div>
</template>

<style lang="scss" scoped>

.dropdown {
	position: relative;
	display: inline-block;
}

.dropdown-trigger {
	display: inline-flex;
}

.dropdown-content {
	display: grid;
	position: absolute;
	inset-inline-start: 0;
	top: calc(100% + 0.3rem);
	padding: 0.3em;
	border: 1px solid var(--c-border);
	border-radius: 0.75rem;
	box-shadow: var(--box-shadow-1), var(--box-shadow-2);
	background-color: var(--ld-bg-blur);
	backdrop-filter: blur(0.5rem);
	font-size: inherit;
	white-space: nowrap;
	z-index: var(--z-index-popover);

	button {
		padding: 0.3em 0.5em;
		border-radius: 0.3em;
		text-align: start;
		color: var(--c-text-1);
		transition: color 0.1s, background-color 0.2s;
		cursor: pointer;

		&:hover {
			background-color: var(--c-bg-soft);
			color: var(--c-text-1);
		}

		&.active {
			background-color: var(--c-primary-soft);
			color: var(--c-primary);
		}
	}
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
	transition: opacity 0.15s, transform 0.15s;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
	opacity: 0;
	transform: translateY(-0.15rem);
}
</style>
