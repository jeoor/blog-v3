<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
	image?: string
	title: string
	description?: string
}>()

const httpUrlRE = /^https?:\/\//

const bannerImageSrc = computed(() => {
	if (!props.image)
		return ''

	if (!httpUrlRE.test(props.image) || props.image.startsWith('https://wsrv.nl/?'))
		return props.image

	const params = new URLSearchParams({
		url: props.image,
		w: '1280',
		h: '320',
		fit: 'cover',
		output: 'webp',
		q: '76',
	})

	return `https://wsrv.nl/?${params.toString()}`
})
</script>

<template>
<div class="page-banner" :class="{ 'no-image': !image }">
	<img v-if="image" class="banner-image" :src="bannerImageSrc" :alt="title" width="1200" height="320" loading="eager" fetchpriority="high" decoding="async">
	<div class="banner-content">
		<h1>{{ title }}</h1>
		<p v-if="description">
			{{ description }}
		</p>
	</div>
	<div class="banner-extra">
		<slot />
	</div>
</div>
</template>

<style lang="scss" scoped>
.page-banner {
	position: relative;
	overflow: hidden;
	min-height: 256px;
	max-height: 320px;
	margin: 1rem;
	border-radius: 8px;

	&::after {
		content: "";
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(#0B1220, 0.16), rgba(#0B1220, 0.56));
		z-index: 0;
	}

	&.no-image {
		background:
			radial-gradient(circle at top right, rgba(#FFF, 0.18), transparent 28%),
			linear-gradient(135deg, #2A4158, #1F3044 45%, #111F2F);

		&::before {
			content: "";
			position: absolute;
			inset: auto -6rem -7rem auto;
			width: 18rem;
			aspect-ratio: 1;
			border-radius: 50%;
			background: radial-gradient(circle, rgba(#FFF, 0.18), transparent 70%);
			z-index: 0;
		}
	}

	.banner-image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.banner-content {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		padding: 1rem;
		text-shadow: 0 4px 5px rgba(#000, 0.5);
		color: #EEE;
		z-index: 1;

		p {
			opacity: 0.9;
		}
	}

	.banner-extra {
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		position: absolute;
		right: 0;
		bottom: 0;
		margin: 1rem;
		z-index: 1;
	}
}
</style>
