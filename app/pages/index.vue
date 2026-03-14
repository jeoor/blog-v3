<script setup lang="ts">
import type { WidgetName } from '~/composables/useWidgets'
import type { ArticleProps } from '~/types/article'
import { sort } from 'radash'

const appConfig = useAppConfig()
useSeoMeta({
	description: appConfig.description,
	ogImage: appConfig.author.avatar,
})

const layoutStore = useLayoutStore()
const homeAsideWidgets: WidgetName[] = ['blog-stats', 'blog-tech', 'tag-cloud', 'countdown']
const homeAsidePlaceholder: WidgetName[] = ['empty']
const homeAsideWidescreenQuery = '(min-width: 1081px)'

layoutStore.setAside(homeAsidePlaceholder)

if (import.meta.client) {
	type IdleWindow = Window & typeof globalThis
	const browser = globalThis as IdleWindow
	let idleId: number | undefined

	const restoreAside = () => {
		idleId = undefined
		layoutStore.setAside(homeAsideWidgets)
	}

	onMounted(() => {
		if (browser.matchMedia(homeAsideWidescreenQuery).matches) {
			restoreAside()
			return
		}

		if (typeof browser.requestIdleCallback === 'function') {
			idleId = browser.requestIdleCallback(restoreAside, { timeout: 1200 })
			return
		}

		idleId = browser.setTimeout(restoreAside, 300)
	})

	onBeforeUnmount(() => {
		if (idleId === undefined)
			return

		if (typeof browser.cancelIdleCallback === 'function') {
			browser.cancelIdleCallback(idleId)
			return
		}

		browser.clearTimeout(idleId)
	})
}
const { data: listRaw } = await useAsyncData<ArticleProps[]>('index_posts', async () => {
	const { useArticleIndexOptions } = await import('~/composables/useArticleIndex')
	return useArticleIndexOptions()
}, { default: () => [] })
const { listSorted, isAscending, sortOrder } = useArticleSort(listRaw, { bindDirectionQuery: 'asc', bindOrderQuery: 'sort' })
const { category, categories, listCategorized } = useCategory(listSorted, { bindQuery: 'category' })
const { page, totalPages, listPaged } = usePagination(listCategorized, { bindQuery: 'page' })

watch(category, () => {
	page.value = 1
})

useSeoMeta({ title: () => (page.value > 1 ? `第${page.value}页` : '') })

const listRecommended = computed<ArticleProps[]>(() => sort<ArticleProps>(
	listRaw.value.filter(item => item?.recommend),
	post => post.recommend || 0,
	true,
))
</script>

<template>
<BlogHeader class="mobile-only" to="/" tag="h1" :show-emoji-tail="false" :split-title="false" />

<UtilHydrateSafe>
	<PostSlide v-if="listRecommended.length && page === 1 && !category" :list="listRecommended" />

	<div class="home-post-list">
		<PostOrderToggle
			v-model:is-ascending="isAscending"
			v-model:sort-order="sortOrder"
			v-model:category="category"
			:categories
		>
			<ZSecret>
				<UtilLink to="/preview" class="preview-entrance" no-prefetch>
					<Icon name="ph:file-lock-bold" />
					查看预览文章
				</UtilLink>
			</ZSecret>
		</PostOrderToggle>

		<menu class="home-post-list-menu proper-height">
			<PostArticle
				v-for="article, index in listPaged"
				:key="article.path"
				v-bind="article"
				no-prefetch
				:to="article.path"
				:use-updated="sortOrder === 'updated'"
				:style="getFixedDelay(index * 0.05)"
			/>
		</menu>

		<ZPagination v-model="page" sticky :total-pages="totalPages" />
	</div>
</UtilHydrateSafe>
</template>
