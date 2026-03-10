<script setup lang="ts">
const appConfig = useAppConfig()
const layoutStore = useLayoutStore()
layoutStore.setAside([])

const { data: about } = await useAsyncData(
	'about-page',
	() => queryCollection('content').path('/about').first(),
)

const aboutImage = computed(() => about.value?.image || '/assets/about-banner.webp')

if (about.value) {
	useSeoMeta({
		title: about.value.title,
		description: about.value.description,
		ogImage: new URL(aboutImage.value, appConfig.url).href,
	})
}
</script>

<template>
<template v-if="about">
	<div class="mobile-only">
		<BlogHeader to="/" :suffix="about.title || '关于'" tag="h1" />
	</div>

	<ZPageBanner
		:title="about.title || '关于我'"
		:description="about.description || ''"
		:image="aboutImage"
	/>

	<div class="about-shell">
		<ContentRenderer
			class="article about-article card"
			:class="getPostTypeClassName(about?.type, { prefix: 'md' })"
			:value="about"
			tag="article"
		/>
	</div>
</template>

<ZError
	v-else
	icon="solar:confounded-square-bold-duotone"
	title="内容为空或页面不存在"
	message="可于 content/about.md 配置关于页内容。"
/>
</template>

<style lang="scss" scoped>
.about-shell {
	width: min(100%, 920px);
	margin: 1rem auto 2rem;
	padding: 0 1rem;
}

.about-article.about-article {
	margin: 0;
	padding: 0.8rem 1.2rem 1.2rem;
}

.about-article :deep(.link-card) {
	display: inline-flex;
	width: calc((100% - 1rem) / 2);
	max-width: none;
	margin: 0.25rem;
	vertical-align: top;
}

@media (min-width: 1200px) {
	.about-article :deep(.link-card) {
		width: calc((100% - 1.5rem) / 3);
	}
}

@media (max-width: $breakpoint-phone) {
	.about-shell {
		padding: 0 0.5rem;
	}

	.about-article :deep(.link-card) {
		width: 100%;
		margin: 0.35rem 0;
	}
}
</style>
