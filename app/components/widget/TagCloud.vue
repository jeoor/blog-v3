<script setup lang="ts">
const { data: articles } = await useAsyncData('widget-tags', () => getArticleIndexOptions(), { default: () => [] })

const tagsWithCount = computed(() => {
	const map = new Map<string, number>()
	for (const article of articles.value) {
		const tags = Array.isArray(article.tags)
			? article.tags
			: typeof article.tags === 'string'
				? [article.tags]
				: []

		if (!tags.length)
			continue

		for (const tag of tags)
			map.set(tag, (map.get(tag) ?? 0) + 1)
	}

	return [...map.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 20)
})
</script>

<template>
<BlogWidget card title="标签云">
	<div class="tag-cloud">
		<NuxtLink
			v-for="[tag, count] in tagsWithCount"
			:key="tag"
			:to="`/tags?tag=${encodeURIComponent(tag)}`"
			class="tag-item"
		>
			{{ tag }} <span class="tag-count">{{ count }}</span>
		</NuxtLink>

		<p v-if="!tagsWithCount.length" class="empty">
			暂无标签
		</p>
	</div>
</BlogWidget>
</template>

<style lang="scss" scoped>
.tag-cloud {
	display: flex;
	flex-wrap: wrap;
	gap: .4rem;
}

.tag-item {
	display: inline-flex;
	align-items: center;
	gap: .3rem;
	padding: .2rem .6rem;
	border-radius: .5rem;
	background-color: var(--c-bg-2);
	color: var(--c-text-2);
	font-size: .8rem;
	line-height: 1.4;
	text-decoration: none;
	transition: background-color .2s, color .2s;

	&:hover {
		background-color: var(--c-bg-3);
		color: var(--c-text);
	}
}

.tag-count {
	color: var(--c-text-3);
	font-size: .7rem;
}

.empty {
	color: var(--c-text-3);
	font-size: .85rem;
	text-align: center;
	width: 100%;
}
</style>
