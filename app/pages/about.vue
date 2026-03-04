<script setup lang="ts">
const layoutStore = useLayoutStore()
layoutStore.setAside([])

const { data: about } = await useAsyncData(
	'about-page',
	() => queryCollection('content').path('/about').first(),
)

if (about.value) {
	useSeoMeta({
		title: about.value.title,
		description: about.value.description,
		ogImage: about.value.image,
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
		:image="about.image || ''"
	/>

	<ContentRenderer
		class="article"
		:class="getPostTypeClassName(about?.type, { prefix: 'md' })"
		:value="about"
		tag="article"
	/>
</template>

<ZError
	v-else
	icon="solar:confounded-square-bold-duotone"
	title="内容为空或页面不存在"
	message="可于 content/about.md 配置关于页内容。"
/>
</template>
