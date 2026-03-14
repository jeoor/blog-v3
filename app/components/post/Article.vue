<script setup lang="ts">
import type { ArticleProps } from '~/types/article'

const props = defineProps<{ useUpdated?: boolean } & ArticleProps>()

const appConfig = useAppConfig()

const showAllDate = isTimeDiffSignificant(props.date, props.updated)

const categoryLabel = computed(() => props.categories?.[0])
const categoryColor = computed(() => appConfig.article.categories[categoryLabel.value!]?.color)
const categoryIcon = computed(() => getCategoryIcon(categoryLabel.value))
</script>

<template>
<UtilLink class="post-article-card card upraise">
	<NuxtImg v-if="image" class="post-article-cover" :src="image" :alt="title" />
	<article>
		<h2 class="post-article-title text-creative">
			{{ title }}
		</h2>

		<p v-if="description" class="post-article-description">
			{{ description }}
		</p>

		<div class="post-article-info">
			<UtilDate
				v-if="date && (showAllDate || !useUpdated)"
				:date
				icon="ph:pencil-simple-line-bold"
			/>

			<UtilDate
				v-if="updated && (showAllDate || useUpdated)"
				:class="{ 'use-updated': useUpdated }"
				:date="updated"
				icon="ph:clock-counter-clockwise-bold"
			/>

			<span
				v-if="categoryLabel"
				class="post-article-category"
				:style="{ '--cg-color': categoryColor }"
			>
				<Icon :name="categoryIcon" />
				{{ categoryLabel }}
			</span>

			<span v-if="readingTime?.words" class="article-words">
				<Icon name="ph:paragraph-bold" />
				{{ formatNumber(readingTime?.words) }}字
			</span>
		</div>
	</article>
</UtilLink>
</template>
