<script setup lang="ts">
import albums from '~/albums'
import type { AlbumImage } from '~/types/album'

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'countdown'])

const route = useRoute()
const router = useRouter()

const title = '相册'
const description = '按文件夹浏览图片，点击可放大查看。'
const image = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&q=80'
useSeoMeta({ title, description, ogImage: image })

const activeFolderId = ref('')
const shuffledImages = ref<AlbumImage[]>([])

watch(() => route.query.folder, (value) => {
	const target = Array.isArray(value) ? value[0] : value
	if (!target) {
		activeFolderId.value = ''
		return
	}

	const exists = albums.some(folder => folder.id === target)
	activeFolderId.value = exists ? target : ''
}, { immediate: true })

const activeFolder = computed(() => albums.find(folder => folder.id === activeFolderId.value))
const showingFolder = computed(() => Boolean(activeFolder.value))

function shuffleImages(images: AlbumImage[]) {
	const list = [...images]
	for (let i = list.length - 1; i > 0; i -= 1) {
		const randomIndex = Math.floor(Math.random() * (i + 1))
		const current = list[i]
		list[i] = list[randomIndex]!
		list[randomIndex] = current!
	}
	return list
}

function refreshOrder() {
	shuffledImages.value = shuffleImages(activeFolder.value?.images || [])
}

watch(activeFolder, () => {
	refreshOrder()
}, { immediate: true })

function openFolder(id: string) {
	router.replace({
		query: {
			...route.query,
			folder: id,
		},
	})
}

function backToFolders() {
	router.replace({
		query: {
			...route.query,
			folder: undefined,
		},
	})
}
</script>

<template>
<ZPageBanner :title :description :image />

<section class="gallery-page">
	<div v-if="!showingFolder" class="folder-panel">
		<header class="panel-head">
			<h3>文件夹</h3>
			<span>共 {{ albums.length }} 个</span>
		</header>

		<div class="folder-grid">
			<button
				v-for="folder in albums"
				:key="folder.id"
				class="folder-card"
				@click="openFolder(folder.id)"
			>
				<div class="folder-cover">
					<NuxtImg
						class="cover-image"
						:src="folder.cover || folder.images[0]?.url"
						:alt="folder.name"
						loading="lazy"
					/>
				</div>

				<div class="folder-meta">
					<h4>{{ folder.name }}</h4>
					<p>{{ folder.images.length }} 张图片</p>
				</div>
			</button>
		</div>
	</div>

	<div v-else class="images-panel">
		<header class="images-head">
			<button class="back-btn" @click="backToFolders">
				<Icon name="ph:caret-left-bold" />
				返回文件夹
			</button>

			<div class="head-main">
				<h3>{{ activeFolder?.name }}</h3>
				<span>共 {{ shuffledImages.length }} 张</span>
			</div>
		</header>

		<div v-if="shuffledImages.length" class="image-grid">
			<article v-for="pic in shuffledImages" :key="pic.url" class="image-card">
				<Pic
					class="image"
					:src="pic.url"
					:alt="pic.title"
					:caption="pic.description || pic.date || pic.title"
				/>
				<div class="meta">
					<h4>{{ pic.title }}</h4>
					<p>{{ pic.description || pic.date || '图片来自图床' }}</p>
				</div>
			</article>
		</div>

		<p v-else class="empty-tip">
			当前文件夹暂无图片。
		</p>
	</div>
</section>
</template>

<style lang="scss" scoped>
.gallery-page {
	animation: float-in .2s backwards;
	margin: 1rem;
}

.folder-panel,
.images-panel {
	padding: 1rem;
	border-radius: 8px;
}

.panel-head {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	gap: 1rem;
	margin-bottom: 1rem;

	h3 {
		margin: 0;
		font: inherit;
		font-weight: 700;
	}

	span {
		font-size: .85rem;
		color: var(--c-text-3);
	}
}

.folder-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	gap: .8rem;

	@media (max-width: $breakpoint-mobile) {
		grid-template-columns: 1fr;
	}
}

.folder-card {
	text-align: left;
	border-radius: .6rem;
	overflow: hidden;
	box-shadow: 0 0 0 1px var(--c-bg-soft);
	transition: transform var(--delay), box-shadow var(--delay);

	&:hover {
		transform: translateY(-2px);
	}

	.folder-cover {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
	}

	.cover-image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.folder-meta {
		padding: .65rem .75rem;
		background-color: var(--c-bg-soft);

		h4 {
			margin: 0;
			font-size: .95rem;
		}

		p {
			margin: .25rem 0 0;
			font-size: .82rem;
			color: var(--c-text-3);
		}
	}
}

.images-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: .8rem;
	margin-bottom: 1rem;

	@media (max-width: $breakpoint-mobile) {
		flex-wrap: wrap;
	}

	.head-main {
		display: flex;
		align-items: baseline;
		gap: .6rem;
		margin-inline-end: auto;

		h3 {
			margin: 0;
			font-size: 1.05rem;
		}

		span {
			font-size: .85rem;
			color: var(--c-text-3);
		}
	}
}

.back-btn {
	display: inline-flex;
	align-items: center;
	gap: .25rem;
	padding: .35rem .6rem;
	border-radius: .45rem;
	font-size: .8rem;
	color: var(--c-text-2);
	transition: color var(--delay), background-color var(--delay);

	&:hover {
		color: var(--c-text);
		background-color: var(--c-bg-soft);
	}
}


.image-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	gap: .8rem;

	@media (max-width: $breakpoint-mobile) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

.image-card {
	display: flex;
	flex-direction: column;
	border-radius: .6rem;
	overflow: hidden;
	box-shadow: 0 0 0 1px var(--c-bg-soft);
	transition: transform var(--delay), box-shadow var(--delay);

	&:hover {
		transform: translateY(-2px);
	}

	.image {
		display: block;
		aspect-ratio: 4 / 3;
		overflow: hidden;

		:deep(img) {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.meta {
		padding: .55rem .65rem;
		background-color: var(--c-bg-soft);

		h4 {
			margin: 0;
			font-size: .95rem;
		}

		p {
			margin: .25rem 0 0;
			font-size: .8rem;
			color: var(--c-text-3);
			line-height: 1.5;
		}
	}
}

.empty-tip {
	margin: 2rem 0;
	text-align: center;
	color: var(--c-text-3);
}
</style>
