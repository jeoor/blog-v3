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
