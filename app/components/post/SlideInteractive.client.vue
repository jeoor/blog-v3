<script setup lang="ts">
import type { ArticleProps } from '~/types/article'
import Autoplay from 'embla-carousel-autoplay'
import emblaCarouselVue from 'embla-carousel-vue'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import SlideScaffold from './SlideScaffold.vue'

defineProps<{ list: ArticleProps[] }>()

const [carouselEl, carouselApi] = emblaCarouselVue({
	containScroll: false,
	loop: true,
	skipSnaps: true,
}, [
	Autoplay({ stopOnInteraction: false, stopOnMouseEnter: true }),
	WheelGesturesPlugin(),
])

const scrollPrevious = () => carouselApi.value?.scrollPrev()
const scrollNext = () => carouselApi.value?.scrollNext()

useEventListener(carouselEl, 'wheel', (e) => {
	const delta = e.deltaX + (e.shiftKey ? e.deltaY : 0)
	if (Math.abs(delta) < 80)
		return

	delta > 0 ? scrollNext() : scrollPrevious()
}, { passive: true })
</script>

<template>
<SlideScaffold
	:list="list"
	:carousel-ref="carouselEl"
	show-actions
	@prev="scrollPrevious"
	@next="scrollNext"
/>
</template>
