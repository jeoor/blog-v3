<script setup lang="ts">
import type { ArticleProps } from '~/types/article'
import { defineAsyncComponent } from 'vue'
import SlideScaffold from './SlideScaffold.vue'

defineProps<{ list: ArticleProps[] }>()

type IdleWindow = Window & typeof globalThis

const shouldEnhance = ref(false)
let idleId: number | undefined

const SlideInteractiveAsync = defineAsyncComponent({
	loader: () => import('~/components/post/SlideInteractive.client.vue'),
	loadingComponent: SlideScaffold,
	delay: 0,
	suspensible: false,
})

onMounted(() => {
	const browser = globalThis as IdleWindow
	const enableCarousel = () => {
		idleId = undefined
		shouldEnhance.value = true
	}

	if (typeof browser.requestIdleCallback === 'function') {
		idleId = browser.requestIdleCallback(enableCarousel, { timeout: 1200 })
		return
	}

	idleId = browser.setTimeout(enableCarousel, 300)
})

onBeforeUnmount(() => {
	if (idleId === undefined)
		return

	const browser = globalThis as IdleWindow
	if (typeof browser.cancelIdleCallback === 'function') {
		browser.cancelIdleCallback(idleId)
		return
	}

	browser.clearTimeout(idleId)
})
</script>

<template>
<SlideScaffold v-if="!shouldEnhance" :list="list" />
<SlideInteractiveAsync v-else :list="list" />
</template>
