<script setup lang="ts">
import { sort } from 'radash'

const { data: listRaw } = await useAsyncData('widget_tags', () => useArticleIndexOptions(), { default: () => [] })

const articlesByTag = computed(() => {
	const result: Record<string, any[]> = {}
	const articles = sort(listRaw.value, a => new Date(a.date || 0).getTime(), true)
	for (const article of articles) {
		if (article.tags) {
			for (const tag of article.tags) {
				if (!result[tag]) {
					result[tag] = []
				}
				result[tag].push(article)
			}
		}
	}
	return result
})

const sortedTags = computed(() => {
	return Object.keys(articlesByTag.value).sort((a, b) => {
		const aCount = articlesByTag.value[a]?.length || 0
		const bCount = articlesByTag.value[b]?.length || 0
		return bCount - aCount
	}).slice(0, 20) // 只显示前20个热门标签
})

function getTagSize(count: number): string {
	const maxCount = Math.max(...Object.values(articlesByTag.value).map(articles => articles.length))
	const minCount = Math.min(...Object.values(articlesByTag.value).map(articles => articles.length))
	const range = maxCount - minCount
	if (range === 0) return 'medium'

	const ratio = (count - minCount) / range
	if (ratio < 0.33) return 'small'
	if (ratio < 0.66) return 'medium'
	return 'large'
}
</script>

<template>
<BlogWidget card title="标签云">
	<div class="tag-cloud-container">
		<NuxtLink
			v-for="tag in sortedTags"
			:key="tag"
			:to="{ path: '/tags', query: { tag } }"
			class="tag-item"
			:class="getTagSize(articlesByTag[tag]?.length || 0)"
		>
			<span class="tag-name">{{ tag }}</span>
			<span class="tag-count">{{ articlesByTag[tag]?.length }}</span>
		</NuxtLink>
	</div>
</BlogWidget>
</template>

<style lang="scss" scoped>
.tag-cloud-container {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.tag-item {
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.25rem 0.5rem;
	border-radius: 0.5rem;
	background-color: transparent;
	color: var(--c-text-2);
	line-height: 1.2;
	transition: background-color 0.2s, color 0.1s;

	&:hover,
	&:focus-visible {
		background-color: var(--c-bg-soft);
		color: var(--c-text);
	}

	&.small { font-size: 0.82em; }
	&.medium { font-size: 0.9em; }
	&.large { font-size: 0.98em; font-weight: 600; }
}

.tag-count {
	font-size: 0.8em;
	color: var(--c-text-3);
}
</style>
