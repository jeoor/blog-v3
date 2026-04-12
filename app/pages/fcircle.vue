<script setup lang="ts">
const DATE_SLASH_RE = /\//g

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'tag-cloud', 'countdown'])

const title = '友圈'
const description = '发现更多有趣的博主。'
const image = '/assets/fcircle-banner.webp'
useSeoMeta({ title, description, ogImage: image })

const API_URL = 'https://fc.kayro.cn/'
const PAGE_SIZE = 20

const allArticles = ref<FriendArticle[]>([])
const displayCount = ref(PAGE_SIZE)
const isLoading = ref(true)
const randomArticle = ref<FriendArticle | null>(null)
const showAvatarPopup = ref(false)
const selectedAuthor = ref('')
const selectedAuthorAvatar = ref('')
const selectedArticleLink = ref('')
const articlesByAuthor = ref<Record<string, FriendArticle[]>>({})
const lastUpdatedDate = ref('')

const displayedArticles = computed(() => allArticles.value.slice(0, displayCount.value))
const hasMoreArticles = computed(() => allArticles.value.length > displayCount.value)

function formatDate(dateString: string): string {
	if (!dateString) return ''
	return toZdtLocaleString(dateString, 'date').replace(DATE_SLASH_RE, '-')
}

function refreshRandomArticle(): void {
	if (!allArticles.value.length) return
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

function handleClickOutside(event: MouseEvent): void {
	const popup = document.getElementById('avatar-popup')
	if (popup && !popup.contains(event.target as Node) && showAvatarPopup.value) {
		closeAvatarPopup()
	}
}

async function fetchArticles(): Promise<void> {
	try {
		isLoading.value = true
		const response = await fetch(`${API_URL}all.json`)
		const data = await response.json() as FcApiData

		allArticles.value = data.article_data.map(item => ({
			id: item.link + Math.random(),
			title: item.title,
			link: item.link,
			author: item.author,
			created: item.created,
			avatar: item.avatar,
		}))

		articlesByAuthor.value = allArticles.value.reduce<Record<string, FriendArticle[]>>((acc, article) => {
			const list = acc[article.author]
			if (list) {
				list.push(article)
			}
			else {
				acc[article.author] = [article]
			}
			return acc
		}, {})

		refreshRandomArticle()

		if (allArticles.value.length > 0) {
			const sorted = [...allArticles.value].sort((a, b) =>
				new Date(b.created).getTime() - new Date(a.created).getTime(),
			)
			const latest = sorted[0]
			if (latest) {
				lastUpdatedDate.value = formatDate(latest.created)
			}
		}
	}
	finally {
		isLoading.value = false
	}
}

onMounted(() => {
	fetchArticles()
	document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
})

interface FriendArticle {
	id: string
	title: string
	link: string
	author: string
	created: string
	avatar: string
}

interface FcApiData {
	article_data: Array<{
		title: string
		link: string
		author: string
		created: string
		avatar: string
	}>
}
</script>

<template>
<ZPageBanner :title :description :image>
	<div class="fcircle-stats">
		<div class="fcircle-stats__update-time">Updated at {{ lastUpdatedDate || '2025-07-17' }}</div>
		<div class="fcircle-stats__powered-by">Powered by FriendCircleLite</div>
	</div>
</ZPageBanner>

<div class="page-fcircle">
	<div class="fcircle">
		<div v-if="randomArticle" class="fcircle__random-article">
			<div class="fcircle__random-title">随机文章</div>
			<div class="article-item">
				<a :href="randomArticle.link" target="_blank" rel="noopener noreferrer"
					class="article-item__container gradient-card">
					<span class="article-item__author">{{ randomArticle.author }}</span>
					<span class="article-item__title">{{ randomArticle.title }}</span>
					<span class="article-item__date">{{ formatDate(randomArticle.created) }}</span>
				</a>
			</div>
			<ZButton class="btn-refresh gradient-card" @click="refreshRandomArticle" icon="uim:process" />
		</div>

		<div class="fcircle__articles">
			<div
				v-for="(article, index) in displayedArticles"
				:key="article.id"
				class="article-item article-item--new"
				:style="{ '--delay': `${(index % PAGE_SIZE) * 0.05}s` }"
			>
				<div class="article-item__image" @click="showAuthorPosts(article.author, article.avatar, article.link)">
					<NuxtImg :src="article.avatar" :alt="article.author" loading="lazy" />
				</div>
				<a :href="article.link" target="_blank" rel="noopener noreferrer"
					class="article-item__container gradient-card">
					<span class="article-item__author">{{ article.author }}</span>
					<span class="article-item__title">{{ article.title }}</span>
					<span class="article-item__date">{{ formatDate(article.created) }}</span>
				</a>
			</div>
		</div>

		<ZButton v-show="hasMoreArticles" class="btn-load-more gradient-card" @click="loadMore" text="加载更多" />

		<div v-if="!isLoading && allArticles.length === 0" class="error-container">
			<Icon class="error-container__icon" name="tabler:file-alert" />
			<p>暂无文章数据</p>
			<p class="empty-hint">请稍后再试</p>
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
								:style="{ '--delay': `${0.2 + index * 0.1}s` }"
							>
								<span class="timeline__date">{{ formatDate(article.created) }}</span>
								<a :href="article.link" target="_blank" rel="noopener noreferrer" class="timeline__title"
									@click="closeAvatarPopup">
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
	animation: float-in .2s backwards;
	margin: 1rem;
}

.fcircle-stats {
	align-items: flex-end;
	color: #eee;
	display: flex;
	flex-direction: column;
	font-family: var(--font-monospace);
	font-size: .7rem;
	gap: .1rem;
	opacity: .7;
	text-shadow: 0 4px 5px rgba(0, 0, 0, .5);

	.fcircle-stats__update-time {
		opacity: 1;
	}

	.fcircle-stats__powered-by {
		opacity: .8;
	}
}

.fcircle {
	.fcircle__random-article {
		align-items: center;
		display: flex;
		flex-direction: row;
		gap: 10px;
		justify-content: space-between;
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
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}
		}
	}

	.fcircle__articles {
		display: flex;
		flex-direction: column;
		gap: .5rem;
	}
}

.article-item {
	align-items: center;
	display: flex;
	gap: 10px;
	width: 100%;

	&.article-item--new {
		animation: float-in .2s var(--delay) backwards;
	}

	.article-item__image {
		border-radius: 50%;
		box-shadow: 0 0 0 1px var(--c-bg-soft);
		display: flex;
		flex-shrink: 0;
		height: 2rem;
		overflow: hidden;
		width: 2rem;

		img {
			height: 100%;
			object-fit: cover;
			opacity: .8;
			transition: all .2s;
			width: 100%;
		}
	}

	.article-item__container {
		align-items: center;
		border-radius: 8px;
		box-shadow: 0 0 0 1px var(--c-bg-soft);
		display: flex;
		gap: 5px;
		height: 2.5rem;
		overflow: hidden;
		padding: 10px;
		width: 100%;

		&:hover .article-item__title {
			color: var(--c-text);
		}

		.article-item__author {
			align-items: center;
			color: var(--c-text-3);
			display: flex;
			flex-shrink: 0;
			font-size: .85rem;
		}

		.article-item__title {
			align-items: center;
			color: var(--c-text-2);
			display: flex;
			flex: 1;
			font-size: .9375rem;
			overflow: hidden;
			text-overflow: ellipsis;
			transition: color .2s;
			white-space: nowrap;
		}

		.article-item__date {
			align-items: center;
			color: var(--c-text-3);
			display: flex;
			flex-shrink: 0;
			font-family: var(--font-monospace);
			font-size: .75rem;
		}
	}
}

.btn-refresh {
	align-items: center;
	background-color: unset;
	border-radius: 8px;
	box-shadow: none;
	color: var(--c-text-2);
	cursor: pointer;
	display: flex;
	flex-shrink: 0;
	height: 2.5rem;
	justify-content: center;
	transition: all .2s ease;
	width: 2.5rem;

	&:hover {
		background-color: unset;
	}
}

.btn-load-more {
	background-color: var(--ld-bg-card);
	border-radius: 8px;
	box-shadow: .1em .2em .5rem var(--ld-shadow);
	display: block;
	font-size: .875rem;
	height: 42px;
	margin: 1rem auto;
	padding: .75rem;
	width: 200px;

	&:hover {
		color: var(--c-text);
	}
}

.modal {
	align-items: center;
	-webkit-backdrop-filter: blur(20px);
	backdrop-filter: blur(20px);
	bottom: 0;
	display: flex;
	justify-content: center;
	left: 0;
	position: fixed;
	right: 0;
	top: 0;
	z-index: 100;

	.modal__content {
		background-color: var(--c-bg-a50);
		border-radius: 12px;
		box-shadow: 0 0 0 1px var(--c-bg-soft);
		max-height: 80vh;
		max-width: 500px;
		overflow-y: auto;
		padding: 1.25rem;
		position: relative;
		width: 90%;

		.modal__header {
			align-items: center;
			border-bottom: 1px solid var(--c-bg-soft);
			display: flex;
			gap: 15px;
			margin-bottom: 20px;
			padding-bottom: 15px;

			img {
				border-radius: 50%;
				height: 50px;
				object-fit: cover;
				width: 50px;
			}

			h3 {
				flex: 1;
				font-size: 1.2rem;
				margin: 0;
			}

			.modal__author-link {
				border-radius: 8px;
				color: var(--c-text-2);
				padding: 8px;
				transition: all .3s;

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
					background-color: var(--c-bg-soft);
					bottom: 0;
					content: "";
					left: .25rem;
					position: absolute;
					top: .5rem;
					transform: translate(-50%);
					width: 2px;
				}

				.timeline__item {
					animation: float-in .3s var(--delay) backwards;
					color: var(--c-text-2);
					padding: 0 0 1rem 1.25rem;
					position: relative;

					&::before {
						background-color: var(--c-text-2);
						border-radius: 50%;
						content: "";
						height: .5rem;
						left: .25rem;
						position: absolute;
						top: .5rem;
						transform: translateY(-50%) translate(-50%);
						transition: transform .3s ease, box-shadow .3s ease;
						width: .5rem;
						z-index: 1;
					}

					&:hover::before {
						box-shadow: 0 0 8px var(--c-text-2);
						transform: translateY(-50%) translate(-50%) scale(1.5);
					}

					.timeline__date {
						color: var(--c-text-3);
						display: block;
						font-family: var(--font-monospace);
						font-size: .875rem;
						margin-bottom: .3rem;
					}

					.timeline__title {
						color: var(--c-text-2);
						line-height: 1.4;
						transition: color .3s;

						&:hover {
							color: var(--c-text);
						}
					}
				}
			}
		}

		.modal__avatar {
			border-radius: 50%;
			bottom: 1.25rem;
			filter: blur(5px);
			height: 128px;
			opacity: .6;
			overflow: hidden;
			pointer-events: none;
			position: absolute;
			right: 1.25rem;
			width: 128px;
			z-index: 1;

			img {
				height: 100%;
				object-fit: cover;
				width: 100%;
			}
		}
	}
}

.modal-enter-active,
.modal-enter-active .modal__content,
.modal-leave-active,
.modal-leave-active .modal__content {
	transition: all .3s ease;
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
	align-items: center;
	color: var(--c-text-2);
	display: flex;
	flex-direction: column;
	gap: 12px;
	height: 400px;
	justify-content: center;

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
