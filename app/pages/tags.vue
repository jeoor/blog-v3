<script setup lang="ts">
import type { LocationQueryValue } from 'vue-router'
import type { ArticleProps } from '~/types/article'
import { orderBy } from 'es-toolkit/array'
import { getFixedDelay } from '~/utils/anim'

const route = useRoute()
const router = useRouter()
const tagQuery = useHydratedQuery('tag', useRouteQuery('tag', ''))

const appConfig = useAppConfig()
const title = '标签'
const description = `${appConfig.title}的所有文章标签。`
useSeoMeta({ title, description })

const { data: listRaw } = await useAsyncData('posts:index', () => queryArticleIndex(), { default: () => [] })

const articlesByTag = computed(() => {
	const result: Record<string, ArticleProps[]> = {}
	const articles = orderBy(listRaw.value, ['date'], ['desc'])

	for (const article of articles) {
		if (!article.tags)
			continue

		for (const tag of article.tags) {
			if (!result[tag])
				result[tag] = []
			result[tag].push(article)
		}
	}

	return result
})

function getTagCount(tag: string): number {
	return articlesByTag.value[tag]?.length ?? 0
}

function normalizeTagQuery(tag: LocationQueryValue | LocationQueryValue[] | undefined): string {
	if (Array.isArray(tag))
		return tag[0] ?? ''
	return tag ?? ''
}

const sortedTags = computed(() => Object.keys(articlesByTag.value)
	.sort((a, b) => getTagCount(b) - getTagCount(a)))

const tagCountRange = computed(() => {
	const counts = Object.values(articlesByTag.value).map(articles => articles.length)
	return counts.length ? { min: Math.min(...counts), max: Math.max(...counts) } : undefined
})

const selectedTag = computed(() => {
	const tag = normalizeTagQuery(tagQuery.value)
	return sortedTags.value.includes(tag) ? tag : ''
})

function getTagSize(count: number): 'small' | 'medium' | 'large' {
	if (!tagCountRange.value)
		return 'medium'

	const { min, max } = tagCountRange.value
	const range = max - min
	if (range === 0)
		return 'medium'

	const ratio = (count - min) / range
	if (ratio < 0.33)
		return 'small'
	if (ratio < 0.66)
		return 'medium'
	return 'large'
}

function handleTagClick(tag: string) {
	router.push({ query: { ...route.query, tag } })
	window.scrollTo({ top: 0, behavior: 'smooth' })
}

function clearSelectedTag() {
	const query = { ...route.query }
	delete query.tag
	router.push({ query })
}
</script>

<template>
<template #aside>
	<WidgetBlogStats />
	<WidgetBlogTech />
	<WidgetCountdown />
</template>

<div class="tags" data-transition-enter>
	<div v-if="selectedTag" class="tag-selected">
		<div class="tag-selected-header">
			<h1 class="tag-selected-title">
				<span class="tag-hashtag">#</span> {{ selectedTag }}
			</h1>
			<button class="tag-clear-btn" aria-label="Clear tag filter" @click="clearSelectedTag">
				<Icon name="tabler:x" />
			</button>
		</div>

		<div class="tag-selected-info">
			共 {{ getTagCount(selectedTag) }} 篇文章
		</div>

		<UtilListTransition v-slot="{ items }" :items="articlesByTag[selectedTag] ?? []">
			<menu class="archive-list">
				<PostArchive
					v-for="article, index in items"
					:key="article.path"
					:data-list-key="article.path"
					v-bind="article"
					:to="article.path"
					:style="getFixedDelay(index * 0.03)"
				/>
			</menu>
		</UtilListTransition>
	</div>

	<div v-else class="tag-cloud">
		<h1 class="tag-cloud-title">
			{{ title }}
		</h1>

		<div class="tag-cloud-content">
			<button
				v-for="tag in sortedTags"
				:key="tag"
				class="tag-cloud-item gradient-card"
				:class="getTagSize(getTagCount(tag))"
				@click="handleTagClick(tag)"
			>
				# {{ tag }}
				<span class="tag-count">{{ getTagCount(tag) }}</span>
			</button>
		</div>

		<div class="tag-cloud-stats">
			共 {{ sortedTags.length }} 个标签
		</div>
	</div>
</div>
</template>

<style scoped>
.tags {
	margin: 1rem;
	padding: 2rem 0;
	animation: float-in var(--motion-fade-duration) var(--motion-easing) backwards;
}

.tag-cloud {
	max-width: 800px;
	margin: 0 auto;
}

.tag-cloud-title {
	margin-bottom: 2rem;
	font-size: 2.5rem;
	text-align: center;
	color: var(--c-text);
}

.tag-cloud-content {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 1rem;
	margin-bottom: 2rem;
}

.tag-cloud-item {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	border-radius: 2rem;
	background-color: var(--c-bg-2);
	line-height: 1.4;
	color: var(--c-text);
	cursor: pointer;

	&.small {
		font-size: 0.9rem;
	}

	&.medium {
		font-size: 1.1rem;
	}

	&.large {
		font-size: 1.3rem;
		font-weight: 600;
	}
}

.tag-count {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 20px;
	min-width: 20px;
	padding: 0 6px;
	border-radius: 10px;
	background-color: var(--c-bg-3);
	font-size: 0.8rem;
	font-weight: 500;
	color: var(--c-text-2);
}

.tag-cloud-stats {
	margin-top: 2rem;
	font-size: 0.9rem;
	text-align: center;
	color: var(--c-text-2);
}

.tag-selected {
	max-width: 800px;
	margin: 0 auto;
}

.tag-selected-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 1rem;
}

.tag-selected-title {
	margin: 0;
	font-family: var(--font-creative);
	font-size: 2.5rem;
	font-weight: 550;
	color: var(--c-text);
}

.tag-hashtag {
	margin-inline-end: 0.1em;
	padding: 0 2px;
	border-radius: 0.2rem;
	background-color: var(--c-primary);
	color: white;
}

.tag-clear-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border: none;
	border-radius: 50%;
	background-color: var(--c-bg-2);
	color: var(--c-text-2);
	transition: all var(--motion-fade-duration) ease;
	cursor: pointer;

	&:hover {
		background-color: var(--c-bg-3);
		color: var(--c-text);
		transform: rotate(90deg);
	}
}

.tag-selected-info {
	margin-bottom: 2rem;
	padding-bottom: 1rem;
	border-bottom: 1px solid var(--c-border);
	font-size: 1rem;
	color: var(--c-text-2);
}

.archive-list {
	margin-top: 1.5rem;
}

@media (max-width: 768px) {
	.tags {
		margin: 0.5rem;
		padding: 1rem 0;
	}

	.tag-cloud-title,
	.tag-selected-title {
		font-size: 2rem;
	}

	.tag-cloud-item {
		gap: 0.4rem;
		padding: 0.4rem 0.8rem;
	}

	.tag-cloud-item.large {
		font-size: 1.2rem;
	}
}
</style>
