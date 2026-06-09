<script setup lang="ts">
import { getFixedDelay } from '~/utils/anim'

const DATE_SLASH_RE = /\//g

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'tag-cloud', 'countdown'])

const title = '友圈'
const description = '发现更多有趣的博主。'
const image = '/banners/fcircle-banner.webp'
useSeoMeta({ title, description, ogImage: image })

interface FcApiData {
	article_data: Array<{
		title: string
		link: string
		author: string
		created: string
		avatar: string
	}>
}

interface FriendArticle {
	id: string
	title: string
	link: string
	author: string
	created: string
	avatar: string
}

const API_URL = 'https://fc.kayro.cn/'
const PAGE_SIZE = 20

const { data: fcData, status } = useFetch<FcApiData>(`${API_URL}all.json`, {
	default: () => ({ article_data: [] }),
	server: false,
})

const displayCount = ref(PAGE_SIZE)
const randomArticle = ref<FriendArticle | null>(null)
const showAvatarPopup = ref(false)
const selectedAuthor = ref('')
const selectedAuthorAvatar = ref('')
const selectedArticleLink = ref('')
const allArticles = computed<FriendArticle[]>(() => fcData.value.article_data.map(item => ({
	id: item.link,
	title: item.title,
	link: item.link,
	author: item.author,
	created: item.created,
	avatar: item.avatar,
})))
const isLoading = computed(() => status.value === 'pending')
const articlesByAuthor = computed(() => allArticles.value.reduce<Record<string, FriendArticle[]>>((acc, article) => {
	const list = acc[article.author]
	if (list)
		list.push(article)
	else
		acc[article.author] = [article]
	return acc
}, {}))
const lastUpdatedDate = computed(() => {
	const latest = [...allArticles.value].sort((a, b) =>
		new Date(b.created).getTime() - new Date(a.created).getTime(),
	)[0]
	return latest ? formatDate(latest.created) : ''
})
const displayedArticles = computed(() => allArticles.value.slice(0, displayCount.value))
const hasMoreArticles = computed(() => allArticles.value.length > displayCount.value)
const isError = computed(() => status.value === 'error')

function formatDate(dateString: string): string {
	if (!dateString)
		return ''
	return toZdtLocaleString(dateString, 'date').replace(DATE_SLASH_RE, '-')
}

function refreshRandomArticle(): void {
	if (!allArticles.value.length)
		return
	const index = Math.floor(Math.random() * allArticles.value.length)
	randomArticle.value = allArticles.value[index] ?? null
}

function loadMore(): void {
	displayCount.value += PAGE_SIZE
}

function showAuthorPosts(author: string, avatar: string, articleLink: string): void {
	selectedAuthor.value = author
	selectedAuthorAvatar.value = avatar
	selectedArticleLink.value = articleLink
	showAvatarPopup.value = true
}

function closeAvatarPopup(): void {
	showAvatarPopup.value = false
}

onMounted(() => {
	if (allArticles.value.length)
		refreshRandomArticle()
})

watch(allArticles, (articles) => {
	if (articles.length && !randomArticle.value)
		refreshRandomArticle()
})
</script>

<template>
<ZPageBanner :title :description :image>
	<div class="fcircle-stats">
		<div v-if="lastUpdatedDate" class="fcircle-stats__update-time">
			Updated at {{ lastUpdatedDate }}
		</div>
		<div v-else-if="isLoading" class="fcircle-stats__update-time">
			Updating...
		</div>
		<div class="fcircle-stats__powered-by">
			Powered by FriendCircleLite
		</div>
	</div>
</ZPageBanner>

<div class="page-fcircle">
	<div class="fcircle">
		<div v-if="randomArticle" class="fcircle__random-article">
			<div class="fcircle__random-title">
				随机文章
			</div>
			<div class="article-item">
				<a
					:href="randomArticle.link" target="_blank" rel="noopener noreferrer"
					class="article-item__container gradient-card"
				>
					<span class="article-item__author">{{ randomArticle.author }}</span>
					<span class="article-item__title">{{ randomArticle.title }}</span>
					<span class="article-item__date">{{ formatDate(randomArticle.created) }}</span>
				</a>
			</div>
			<ZButton class="btn-refresh gradient-card" icon="uim:process" @click="refreshRandomArticle" />
		</div>

		<div class="fcircle__articles">
			<div
				v-for="(article, index) in displayedArticles"
				:key="article.id"
				class="article-item article-item--new"
				:style="getFixedDelay((index % PAGE_SIZE) * 0.05)"
			>
				<div class="article-item__image" @click="showAuthorPosts(article.author, article.avatar, article.link)">
					<NuxtImg :src="article.avatar" :alt="article.author" loading="lazy" />
				</div>
				<a
					:href="article.link" target="_blank" rel="noopener noreferrer"
					class="article-item__container gradient-card"
				>
					<span class="article-item__author">{{ article.author }}</span>
					<span class="article-item__title">{{ article.title }}</span>
					<span class="article-item__date">{{ formatDate(article.created) }}</span>
				</a>
			</div>
		</div>

		<ZButton v-show="hasMoreArticles" class="btn-load-more gradient-card" text="加载更多" @click="loadMore" />

		<div v-if="isError" class="error-container">
			<Icon class="error-container__icon" name="tabler:file-alert" />
			<p>友圈数据加载失败</p>
			<p class="empty-hint">
				请稍后再试
			</p>
		</div>

		<div v-else-if="!isLoading && allArticles.length === 0" class="error-container">
			<Icon class="error-container__icon" name="tabler:notes-off" />
			<p>暂无文章数据</p>
		</div>

		<Transition name="modal">
			<div
				v-if="showAvatarPopup && selectedAuthor && articlesByAuthor[selectedAuthor] != null"
				id="avatar-popup"
				class="modal"
				@click="closeAvatarPopup"
			>
				<div class="modal__content" @click.stop>
					<div class="modal__header">
						<NuxtImg :src="selectedAuthorAvatar" :alt="selectedAuthor" loading="lazy" class="modal__avatar-img" />
						<h3>{{ selectedAuthor }}</h3>
						<a :href="selectedArticleLink" target="_blank" rel="noopener noreferrer" class="modal__author-link">
							<Icon name="lucide:external-link" />
						</a>
					</div>
					<div class="modal__body">
						<div class="timeline">
							<div
								v-for="(article, index) in articlesByAuthor[selectedAuthor]?.slice(0, 10) ?? []"
								:key="article.id"
								class="timeline__item"
								:style="getFixedDelay(0.2 + index * 0.1)"
							>
								<span class="timeline__date">{{ formatDate(article.created) }}</span>
								<a
									:href="article.link" target="_blank" rel="noopener noreferrer" class="timeline__title"
									@click="closeAvatarPopup"
								>
									{{ article.title }}
								</a>
							</div>
						</div>
					</div>
					<div class="modal__avatar">
						<NuxtImg :src="selectedAuthorAvatar" :alt="selectedAuthor" loading="lazy" />
					</div>
				</div>
			</div>
		</Transition>
	</div>
</div>
</template>

<style lang="scss" scoped>
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

	.fcircle-stats__update-time {
		opacity: 1;
	}

	.fcircle-stats__powered-by {
		opacity: 0.8;
	}
}

.fcircle {
	.fcircle__random-article {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
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

.article-item {
	display: flex;
	align-items: center;
	gap: 10px;
	width: 100%;

	&.article-item--new {
		animation: float-in 0.2s var(--delay) backwards;
	}

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

		&:hover .article-item__title {
			color: var(--c-text);
		}

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

	&:hover {
		color: var(--c-text);
	}
}

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

						&:hover {
							color: var(--c-text);
						}
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

.error-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12px;
	height: 400px;
	color: var(--c-text-2);

	.error-container__icon {
		font-size: 4rem;
	}
}

@media (max-width: 768px) {
	.fcircle__random-article .fcircle__random-title {
		display: none;
	}

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
