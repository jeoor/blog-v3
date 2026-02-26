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
	<ZPageBanner
		:title="about.title || '关于我'"
		:description="about.description || ''"
		:image="about.image || ''"
	/>

	<ContentRenderer
		class="article about-article"
		:class="getPostTypeClassName(about?.type, { prefix: 'md' })"
		:value="about"
		tag="article"
	/>
</template>

<ZError
	v-else
	icon="solar:confounded-square-bold-duotone"
	title="关于页内容不存在"
/>
</template>

<style lang="scss" scoped>
.about-article {
	animation: float-in .2s backwards;
	margin: 1rem;
}
</style>
