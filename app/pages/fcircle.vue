<script setup lang="ts">
import type { WidgetName } from '~/composables/useWidgets'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

interface FriendCircleApiItem {
	title: string
	link: string
	author: string
	created: string
	avatar: string
}

interface FriendCircleArticle extends FriendCircleApiItem {
	id: string
}

interface FriendCircleApiResponse {
	article_data?: FriendCircleApiItem[]
	statistical_data?: {
		last_updated_time?: string
	}
}

const layoutStore = useLayoutStore()
const fcircleAsideWidgets: WidgetName[] = ['blog-stats', 'blog-tech', 'countdown']
const fcircleAsidePlaceholder: WidgetName[] = ['empty']
const fcircleAsideWidescreenQuery = '(min-width: 1081px)'

layoutStore.setAside(fcircleAsidePlaceholder)

const title = '朋友圈'
const description = '发现更多有趣的博主。'
const image = '/assets/fcircle-banner.webp'
const ogImage = 'https://bu.dusays.com/2026/03/05/69a99d24ab46c.webp'
const httpUrlRE = /^https?:\/\//
const dateSlashRE = /\//g

useSeoMeta({ title, description, ogImage })

// 配置选项
const UserConfig = reactive({
	api_url: 'https://fc.kayro.cn/',
	page_size: 20,
})

// 状态管理
const allArticles = ref<FriendCircleArticle[]>([])
const displayCount = ref(20)
const isLoading = ref(true)
const randomArticle = ref<FriendCircleArticle | null>(null)
const showAvatarPopup = ref(false)
const selectedAuthor = ref('')
const selectedAuthorAvatar = ref('')
const selectedArticleLink = ref('')
const articlesByAuthor = ref<Record<string, FriendCircleArticle[]>>({})
const lastUpdatedDate = ref('')

// 计算属性
const displayedArticles = computed(() => allArticles.value.slice(0, displayCount.value))
const hasMoreArticles = computed(() => allArticles.value.length > displayCount.value)

function getOptimizedImageUrl(src: string, options?: {
	width?: number
	height?: number
	fit?: 'cover' | 'contain'
	quality?: number
}) {
	if (!src || !httpUrlRE.test(src) || src.startsWith('https://wsrv.nl/?'))
		return src

	const params = new URLSearchParams({
		url: src,
		output: 'webp',
		q: String(options?.quality ?? 78),
	})

	if (options?.width)
		params.set('w', String(options.width))

	if (options?.height)
		params.set('h', String(options.height))

	if (options?.fit)
		params.set('fit', options.fit)

	return `https://wsrv.nl/?${params.toString()}`
}

// 格式化日期
function formatDate(dateString: string) {
	if (!dateString)
		return ''

	return toZdtLocaleString(dateString, 'date').replace(dateSlashRE, '-')
}

// 刷新随机文章
function refreshRandomArticle() {
	if (allArticles.value.length > 0) {
		const randomIndex = Math.floor(Math.random() * allArticles.value.length)
		randomArticle.value = allArticles.value[randomIndex] ?? null
	}
}

// 加载更多
function loadMore() {
	displayCount.value += UserConfig.page_size
}

// 模态框相关
function showAvatarPosts(author: string, avatar: string, articleLink: string) {
	selectedAuthor.value = author
	selectedAuthorAvatar.value = avatar
	selectedArticleLink.value = articleLink
	showAvatarPopup.value = true
}

function closeAvatarPopup() {
	showAvatarPopup.value = false
}

// 监听点击外部关闭弹窗
function handleClickOutside(event: MouseEvent) {
	const popup = document.getElementById('avatar-popup')
	if (popup && event.target instanceof Node && !popup.contains(event.target) && showAvatarPopup.value) {
		closeAvatarPopup()
	}
}

// 获取数据
async function fetchData() {
	try {
		isLoading.value = true
		const response = await fetch(`${UserConfig.api_url}all.json`)
		const data = await response.json() as FriendCircleApiResponse
		const rawArticles = Array.isArray(data.article_data) ? data.article_data : []
		const apiLastUpdatedTime = data.statistical_data?.last_updated_time

		if (apiLastUpdatedTime)
			lastUpdatedDate.value = apiLastUpdatedTime

		// 处理数据
		allArticles.value = rawArticles.map((item, index) => ({
			id: `${item.link}-${index}`,
			title: item.title,
			link: item.link,
			author: item.author,
			created: item.created,
			avatar: item.avatar,
		}))

		// 按作者分组
		articlesByAuthor.value = allArticles.value.reduce<Record<string, FriendCircleArticle[]>>((acc, article) => {
			const list = acc[article.author] ?? (acc[article.author] = [])
			list.push(article)
			return acc
		}, {})

		// 初始化随机文章
		refreshRandomArticle()

		// 设置最新更新日期
		if (!lastUpdatedDate.value && allArticles.value.length > 0) {
			const sortedArticles = allArticles.value.toSorted((a, b) =>
				new Date(b.created).getTime() - new Date(a.created).getTime())
			const latest = sortedArticles[0]
			if (latest)
				lastUpdatedDate.value = formatDate(latest.created)
		}
	}
	catch (error) {
		console.error('加载文章失败:', error)
	}
	finally {
		isLoading.value = false
	}
}

// 生命周期钩子
if (import.meta.client) {
	type IdleWindow = Window & typeof globalThis
	const browser = globalThis as IdleWindow
	let idleId: number | undefined

	const restoreAside = () => {
		idleId = undefined
		layoutStore.setAside(fcircleAsideWidgets)
	}

	onMounted(() => {
		if (browser.matchMedia(fcircleAsideWidescreenQuery).matches) {
			restoreAside()
			return
		}

		if (typeof browser.requestIdleCallback === 'function') {
			idleId = browser.requestIdleCallback(restoreAside, { timeout: 1200 })
			return
		}

		idleId = browser.setTimeout(restoreAside, 300)
	})

	onUnmounted(() => {
		if (idleId === undefined)
			return

		if (typeof browser.cancelIdleCallback === 'function') {
			browser.cancelIdleCallback(idleId)
			return
		}

		browser.clearTimeout(idleId)
	})
}

onMounted(() => {
	fetchData()
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
<ZPageBanner :title :description :image>
	<div class="fcircle-stats">
		<div class="fcircle-stats__update-time">
			更新于 {{ lastUpdatedDate || '--' }}
		</div>
		<div class="fcircle-stats__powered-by">
			由 FriendCircleLite 驱动
		</div>
	</div>
</ZPageBanner>

<div class="page-fcircle">
	<div class="fcircle">
		<!-- 随机文章区域 -->
		<section class="fcircle__random-article" :class="{ 'is-loading': isLoading && !randomArticle }" :aria-busy="isLoading && !randomArticle">
			<h2 class="fcircle__random-title">
				随机文章
			</h2>
			<div class="article-item">
				<a
					v-if="randomArticle"
					:href="randomArticle.link"
					target="_blank"
					rel="noopener noreferrer"
					class="article-item__container gradient-card"
				>
					<span class="article-item__author">{{ randomArticle.author }}</span>
					<span class="article-item__title">{{ randomArticle.title }}</span>
					<span class="article-item__date">{{ formatDate(randomArticle.created) }}</span>
				</a>
				<div v-else class="article-item__container article-item__container--placeholder gradient-card" aria-hidden="true">
					<span class="article-item__author skeleton-line skeleton-line--short" />
					<span class="article-item__title skeleton-line" />
					<span class="article-item__date skeleton-line skeleton-line--tiny" />
				</div>
			</div>
			<ZButton
				class="btn-refresh gradient-card"
				icon="ph:arrows-clockwise-bold"
				title="换一篇随机文章"
				aria-label="换一篇随机文章"
				:disabled="!allArticles.length"
				@click="refreshRandomArticle"
			/>
		</section>

		<!-- 文章列表区域 -->
		<div class="fcircle__articles">
			<template v-if="isLoading">
				<div
					v-for="index in UserConfig.page_size"
					:key="`skeleton-${index}`"
					class="article-item article-item--placeholder"
					aria-hidden="true"
				>
					<div class="article-item__image article-item__image--placeholder" />
					<div class="article-item__container article-item__container--placeholder gradient-card">
						<span class="article-item__author skeleton-line skeleton-line--short" />
						<span class="article-item__title skeleton-line" />
						<span class="article-item__date skeleton-line skeleton-line--tiny" />
					</div>
				</div>
			</template>
			<div
				v-for="(article, index) in displayedArticles"
				v-else
				:key="article.id"
				class="article-item article-item--new"
				:style="{ '--delay': `${(index % UserConfig.page_size) * 0.05}s` }"
			>
				<div class="article-item__image" @click="showAvatarPosts(article.author, article.avatar, article.link)">
					<img
						:src="getOptimizedImageUrl(article.avatar, { width: 64, height: 64, fit: 'cover', quality: 74 })"
						:alt="article.author"
						loading="lazy"
						decoding="async"
						width="64"
						height="64"
					>
				</div>
				<a
					:href="article.link"
					target="_blank"
					rel="noopener noreferrer"
					class="article-item__container gradient-card"
				>
					<span class="article-item__author">{{ article.author }}</span>
					<span class="article-item__title">{{ article.title }}</span>
					<span class="article-item__date">{{ formatDate(article.created) }}</span>
				</a>
			</div>
		</div>

		<!-- 加载更多按钮 -->
		<ZButton
			v-show="hasMoreArticles"
			class="btn-load-more gradient-card"
			text="加载更多"
			@click="loadMore"
		/>

		<!-- 空状态 -->
		<ZError
			v-if="!isLoading && allArticles.length === 0"
			icon="solar:confounded-square-bold-duotone"
			title="内容为空或页面不存在"
			message="暂无文章数据，请稍后再试。"
		/>

		<!-- 作者模态框 - 时间线样式 -->
		<Transition name="modal">
			<div
				v-if="showAvatarPopup && selectedAuthor && articlesByAuthor[selectedAuthor]"
				id="avatar-popup"
				class="modal"
				@click="closeAvatarPopup"
			>
				<div class="modal__content" @click.stop>
					<div class="modal__header">
						<NuxtImg
							:src="getOptimizedImageUrl(selectedAuthorAvatar, { width: 128, height: 128, fit: 'cover', quality: 78 })"
							:alt="selectedAuthor"
							loading="lazy"
							decoding="async"
							width="128"
							height="128"
							class="modal__avatar-img"
						/>
						<h3>{{ selectedAuthor }}</h3>
						<a
							:href="selectedArticleLink"
							target="_blank"
							rel="noopener noreferrer"
							class="modal__author-link"
						>
							<Icon name="ph:arrow-square-out-bold" />
						</a>
					</div>
					<div class="modal__body">
						<div class="timeline">
							<div
								v-for="(article, index) in (articlesByAuthor[selectedAuthor] || []).slice(0, 10)"
								:key="article.id"
								class="timeline__item"
								:style="{ '--delay': `${0.2 + index * 0.1}s` }"
							>
								<span class="timeline__date">{{ formatDate(article.created) }}</span>
								<a
									:href="article.link"
									target="_blank"
									rel="noopener noreferrer"
									class="timeline__title"
									@click="closeAvatarPopup"
								>
									{{ article.title }}
								</a>
							</div>
						</div>
					</div>
					<div class="modal__avatar">
						<NuxtImg
							:src="getOptimizedImageUrl(selectedAuthorAvatar, { width: 256, height: 256, fit: 'cover', quality: 72 })"
							:alt="selectedAuthor"
							loading="lazy"
							decoding="async"
							width="256"
							height="256"
						/>
					</div>
				</div>
			</div>
		</Transition>
	</div>
</div>
</template>

<style lang="scss" scoped>
/* 动画定义 */
@keyframes pulse-fade {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.5; }
}

@keyframes slide-in-up {
	0% {
		opacity: 0;
		transform: translateY(20px);
	}

	100% {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 主要样式 */
.page-fcircle {
	margin: 1rem;
	animation: float-in 0.2s backwards;
}

.fcircle-stats {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 0.1rem;
	opacity: 0.7;
	font-family: var(--font-monospace);
	font-size: 0.7rem;
	text-shadow: 0 4px 5px rgb(0 0 0 / 50%);
	color: #EEE;

	.fcircle-stats__update-time { opacity: 1; }
	.fcircle-stats__powered-by { opacity: 0.8; }
}

.fcircle {
	.fcircle__random-article {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		min-height: 2.5rem;
		margin: 1rem 0;

		.fcircle__random-title {
			font-size: 1.2rem;
			white-space: nowrap;
		}

		.article-item {
			flex: 1;
			min-width: 0;

			.article-item__container {
				min-width: 0;

				.article-item__title {
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
			}
		}
	}

	.fcircle__articles {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
}

/* 文章项样式 */
.article-item {
	display: flex;
	align-items: center;
	gap: 10px;
	width: 100%;
	min-height: 2.5rem;

	&.article-item--new { animation: float-in 0.2s var(--delay) backwards; }
	&.article-item--placeholder { animation: none; }

	.article-item__image {
		display: flex;
		flex-shrink: 0;
		overflow: hidden;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		box-shadow: 0 0 0 1px var(--c-bg-soft);

		img {
			opacity: 0.8;
			width: 100%;
			height: 100%;
			transition: all 0.2s;
			object-fit: cover;
		}

		&.article-item__image--placeholder {
			box-shadow: none;
			background: linear-gradient(90deg, var(--c-bg-soft), var(--c-bg-2), var(--c-bg-soft));
			background-size: 200% 100%;
			animation: pulse-fade 1.2s ease-in-out infinite;
		}
	}

	.article-item__container {
		display: flex;
		align-items: center;
		gap: 5px;
		overflow: hidden;
		width: 100%;
		height: 2.5rem;
		padding: 10px;
		border-radius: 8px;
		box-shadow: 0 0 0 1px var(--c-bg-soft);

		&.article-item__container--placeholder {
			box-shadow: 0 0 0 1px var(--c-bg-soft);
		}

		&:hover .article-item__title { color: var(--c-text); }

		.article-item__author {
			display: flex;
			flex-shrink: 0;
			align-items: center;
			font-size: 0.85rem;
			color: var(--c-text-3);
		}

		.article-item__title {
			display: flex;
			flex: 1;
			align-items: center;
			overflow: hidden;
			font-size: 0.9375rem;
			white-space: nowrap;
			text-overflow: ellipsis;
			color: var(--c-text-2);
			transition: color 0.2s;
		}

		.article-item__date {
			display: flex;
			flex-shrink: 0;
			align-items: center;
			font-family: var(--font-monospace);
			font-size: 0.75rem;
			color: var(--c-text-3);
		}
	}
}

.skeleton-line {
	display: block;
	height: 0.8rem;
	border-radius: 999px;
	background: linear-gradient(90deg, var(--c-bg-soft), var(--c-bg-2), var(--c-bg-soft));
	background-size: 200% 100%;
	animation: pulse-fade 1.2s ease-in-out infinite;

	&.skeleton-line--short { width: 4.5rem; }
	&.skeleton-line--tiny { width: 3.25rem; }
}

/* 按钮样式 */
.btn-refresh {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	border-radius: 8px;
	box-shadow: none;
	background-color: unset;
	color: var(--c-text-2);
	transition: all 0.2s ease;
	cursor: pointer;

	&:hover {
		background-color: unset;
	}
}

.btn-load-more {
	display: block;
	width: 200px;
	height: 42px;
	margin: 1rem auto;
	padding: 0.75rem;
	border-radius: 8px;
	box-shadow: 0.1em 0.2em 0.5rem var(--ld-shadow);
	background-color: var(--ld-bg-card);
	font-size: 0.875rem;

	&:hover { color: var(--c-text); }
}

/* 模态框样式 */
.modal {
	display: flex;
	align-items: center;
	justify-content: center;
	position: fixed;
	inset: 0;
	backdrop-filter: blur(20px);
	z-index: 100;

	.modal__content {
		position: relative;
		overflow-y: auto;
		width: 90%;
		max-width: 500px;
		max-height: 80vh;
		padding: 1.25rem;
		border-radius: 12px;
		box-shadow: 0 0 0 1px var(--c-bg-soft);
		background-color: var(--c-bg-a50);

		.modal__header {
			display: flex;
			align-items: center;
			gap: 15px;
			margin-bottom: 20px;
			padding-bottom: 15px;
			border-bottom: 1px solid var(--c-bg-soft);

			img {
				width: 50px;
				height: 50px;
				border-radius: 50%;
				object-fit: cover;
			}

			h3 {
				flex: 1;
				margin: 0;
				font-size: 1.2rem;
			}

			.modal__author-link {
				padding: 8px;
				border-radius: 8px;
				color: var(--c-text-2);
				transition: all 0.3s;

				&:hover {
					background: var(--c-bg-soft);
					color: var(--c-text);
				}
			}
		}

		.modal__body {
			.timeline {
				position: relative;

				&::after {
					content: "";
					position: absolute;
					top: 0.5rem;
					bottom: 0;
					left: 0.25rem;
					width: 2px;
					background-color: var(--c-bg-soft);
					transform: translate(-50%);
				}

				.timeline__item {
					position: relative;
					padding: 0 0 1rem 1.25rem;
					color: var(--c-text-2);
					animation: float-in 0.3s var(--delay) backwards;

					&::before {
						content: "";
						position: absolute;
						top: 0.5rem;
						left: 0.25rem;
						width: 0.5rem;
						height: 0.5rem;
						border-radius: 50%;
						background-color: var(--c-text-2);
						transform: translateY(-50%) translate(-50%);
						transition: transform 0.3s ease, box-shadow 0.3s ease;
						z-index: 1;
					}

					&:hover::before {
						box-shadow: 0 0 8px var(--c-text-2);
						transform: translateY(-50%) translate(-50%) scale(1.5);
					}

					.timeline__date {
						display: block;
						margin-bottom: 0.3rem;
						font-family: var(--font-monospace);
						font-size: 0.875rem;
						color: var(--c-text-3);
					}

					.timeline__title {
						line-height: 1.4;
						color: var(--c-text-2);
						transition: color 0.3s;

						&:hover { color: var(--c-text); }
					}
				}
			}
		}

		.modal__avatar {
			position: absolute;
			overflow: hidden;
			opacity: 0.6;
			right: 1.25rem;
			bottom: 1.25rem;
			width: 128px;
			height: 128px;
			border-radius: 50%;
			filter: blur(5px);
			pointer-events: none;
			z-index: 1;

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}
	}
}

/* 模态框过渡 */
.modal-enter-active,
.modal-enter-active .modal__content,
.modal-leave-active,
.modal-leave-active .modal__content {
	transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}

.modal-enter-from .modal__content,
.modal-leave-to .modal__content {
	transform: translateY(-20px);
}

.modal-enter-to,
.modal-leave-from {
	opacity: 1;
}

.modal-enter-to .modal__content,
.modal-leave-from .modal__content {
	transform: translateY(0);
}

/* 错误容器 */
.error-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12px;
	height: 400px;
	color: var(--c-text-2);

	.error-container__icon { font-size: 4rem; }
}

/* 移动端适配 */
@media (max-width: 768px) {
	.fcircle__random-article .fcircle__random-title { display: none; }

	.page-fcircle .article-item .article-item__container {
		flex-wrap: wrap;
		height: auto;
	}

	.page-fcircle .article-item .article-item__container .article-item__author {
		flex-grow: 1;
	}

	.page-fcircle .article-item .article-item__container .article-item__title {
		flex-basis: 100%;
		order: 3;
		white-space: normal;
	}
}
</style>
