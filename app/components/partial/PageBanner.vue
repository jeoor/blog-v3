<script setup lang="ts">
defineProps<{
	image: string
	title: string
	description?: string
}>()
</script>

<template>
<div class="page-banner" :style="{ backgroundImage: `url(${image})` }">
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
	min-height: 16rem;
	max-height: 20rem;
	margin: 0.5rem;
	border-radius: 0.5rem;
	background-position: 50%;
	background-size: cover;

	.banner-content {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: absolute;
		inset: 0;
		padding: 1rem;
		text-shadow: var(--text-shadow-black);
		color: white;

		p {
			opacity: 0.9;
		}
	}

	.banner-extra {
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		position: absolute;
		inset-inline-end: 0;
		bottom: 0;
		margin: 1rem;
	}
}
</style>
