<script setup lang="ts">
import type { ArticleProps } from '~/types/article'
import { orderBy } from 'es-toolkit/array'

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'countdown'])

const appConfig = useAppConfig()
const title = '标签'
const description = `${appConfig.title}的所有文章标签。`
useSeoMeta({ title, description })

const { data: listRaw } = await useAsyncData('index_posts', () => useArticleIndexOptions(), { default: () => [] })

// 选中的标签
const selectedTag = ref('')

// 计算每个标签对应的文章
const articlesByTag = computed(() => {
	const result: Record<string, ArticleProps[]> = {}
	const articles = orderBy(listRaw.value, ['date'], ['desc'])

	for (const article of articles) {
		if (!article.tags) {
			continue
		}

		for (const tag of article.tags) {
			if (!result[tag]) {
				result[tag] = []
			}
			result[tag].push(article)
		}
	}

	return result
})

function getTagCount(tag: string): number {
	return articlesByTag.value[tag]?.length ?? 0
}

// 排序后的标签列表（按文章数量降序）
const sortedTags = computed(() => Object.keys(articlesByTag.value)
	.sort((a, b) => getTagCount(b) - getTagCount(a)))

// 根据文章数量计算标签大小的函数
function getTagSize(count: number): 'small' | 'medium' | 'large' {
	const counts = Object.values(articlesByTag.value).map(articles => articles.length)
	if (!counts.length) {
		return 'medium'
	}

	const maxCount = Math.max(...counts)
	const minCount = Math.min(...counts)
	const range = maxCount - minCount
	if (range === 0) {
		return 'medium'
	}

	const ratio = (count - minCount) / range
	if (ratio < 0.33) {
		return 'small'
	}
	if (ratio < 0.66) {
		return 'medium'
	}
	return 'large'
}

// 点击标签显示对应文章
function handleTagClick(tag: string) {
	selectedTag.value = tag
	window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 取消选中标签，返回标签云视图
function clearSelectedTag() {
	selectedTag.value = ''
}
</script>

<template>
<div class="tags">
	<!-- 选中标签时显示 -->
	<div v-if="selectedTag" class="tag-selected">
		<div class="tag-selected-header">
			<h1 class="tag-selected-title">
				<span class="tag-hashtag">#</span> {{ selectedTag }}
			</h1>
			<button class="tag-clear-btn" aria-label="返回标签云" @click="clearSelectedTag">
				<Icon name="tabler:playstation-x" />
			</button>
		</div>
		<div class="tag-selected-info">
			共 {{ getTagCount(selectedTag) }} 篇文章
		</div>

		<menu class="archive-list">
			<TransitionGroup appear name="float-in">
				<PostArchive
					v-for="article, index in articlesByTag[selectedTag] ?? []"
					:key="article.path"
					v-bind="article"
					:to="article.path"
					:style="{ '--delay': `${index * 0.03}s` }"
				/>
			</TransitionGroup>
		</menu>
	</div>

	<!-- 标签云视图 -->
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

<style lang="scss" scoped>
.tags {
	margin: 1rem;
	padding: 2rem 0;
}

// 标签云样式
.tag-cloud {
	margin: 0 auto;
	max-width: 800px;
}

.tag-cloud-title {
	margin-bottom: 2rem;
	color: var(--c-text);
	font-size: 2.5rem;
	text-align: center;
}

.tag-cloud-content {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	justify-content: center;
	margin-bottom: 2rem;
}

.tag-cloud-item {
	align-items: center;
	background-color: var(--c-bg-2);
	border-radius: 2rem;
	color: var(--c-text);
	cursor: pointer;
	display: inline-flex;
	gap: .5rem;
	line-height: 1.4;
	padding: .5rem 1rem;

	&.small {
		font-size: .9rem;
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
	align-items: center;
	background-color: var(--c-bg-3);
	border-radius: 10px;
	color: var(--c-text-2);
	display: inline-flex;
	font-size: .8rem;
	font-weight: 500;
	height: 20px;
	justify-content: center;
	min-width: 20px;
	padding: 0 6px;
}

.tag-cloud-stats {
	color: var(--c-text-2);
	font-size: .9rem;
	margin-top: 2rem;
	text-align: center;
}

// 选中标签时的样式
.tag-selected {
	margin: 0 auto;
	max-width: 800px;
}

.tag-selected-header {
	align-items: center;
	display: flex;
	justify-content: space-between;
	margin-bottom: 1rem;
}

.tag-selected-title {
	color: var(--c-text);
	font-family: var(--font-creative);
	font-size: 2.5rem;
	font-weight: 550;
	margin: 0;
}

.tag-hashtag {
	background-color: var(--c-primary);
	border-radius: .2rem;
	color: white;
	margin-inline-end: .1em;
	padding: 0 2px;
}

.tag-clear-btn {
	align-items: center;
	background-color: var(--c-bg-2);
	border: none;
	border-radius: 50%;
	color: var(--c-text-2);
	cursor: pointer;
	display: flex;
	height: 40px;
	justify-content: center;
	transition: all .2s ease;
	width: 40px;

	&:hover {
		background-color: var(--c-bg-3);
		color: var(--c-text);
		transform: rotate(90deg);
	}
}

.tag-selected-info {
	border-bottom: 1px solid var(--c-border);
	color: var(--c-text-2);
	font-size: 1rem;
	margin-bottom: 2rem;
	padding-bottom: 1rem;
}

.archive-list {
	margin-top: 1.5rem;
}

// 响应式设计
@media (max-width: 768px) {
	.tags {
		margin: .5rem;
		padding: 1rem 0;
	}

	.tag-cloud-title,
	.tag-selected-title {
		font-size: 2rem;
	}

	.tag-cloud-item {
		gap: .4rem;
		padding: .4rem .8rem;
	}

	.tag-cloud-item.large {
		font-size: 1.2rem;
	}
}
</style>
