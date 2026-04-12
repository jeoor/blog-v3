<script setup lang="ts">
import type { GalleryFolder, GalleryImage } from '~/types/gallery'
import galleryBase from '~/gallery'

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'tag-cloud', 'countdown'])

const route = useRoute()
const router = useRouter()

const title = '相册'
const description = '用镜头记录生活。'
const image = '/assets/gallery-banner.webp'
useSeoMeta({ title, description, ogImage: image })

const hydrated = ref(false)

function getImageUrl(image?: GalleryImage): string {
	if (!image)
		return ''
	return typeof image === 'string' ? image : image.url
}

function getStableIndex(seed: string, length: number): number {
	let hash = 0
	for (let i = 0; i < seed.length; i += 1)
		hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
	return hash % length
}

function pickStableImage(images: GalleryImage[], seed: string): string | undefined {
	if (!images.length)
		return undefined
	const index = getStableIndex(seed, images.length)
	return getImageUrl(images[index]) || undefined
}

const gallery: GalleryFolder[] = galleryBase.map(folder => ({
	...folder,
	cover: pickStableImage(folder.images, folder.id),
}))

function resolveFolderId(value?: string | string[]): string {
	const target = (Array.isArray(value) ? value[0] : value) || ''
	if (!target)
		return ''
	return gallery.some(folder => folder.id === target) ? target : ''
}

const activeFolderId = computed(() => resolveFolderId(route.query.c as string | string[]))
const activeFolder = computed(() => gallery.find(folder => folder.id === activeFolderId.value))
const showingFolder = computed(() => Boolean(activeFolder.value))
const shuffledImages = ref<GalleryImage[]>([])

function getImageAlt(image: GalleryImage, index: number): string {
	if (typeof image !== 'string' && image.title)
		return image.title
	return `${activeFolder.value?.name || '相册'}-${index + 1}`
}

function shuffleList<T>(items: T[]): T[] {
	const list = [...items]
	for (let i = list.length - 1; i > 0; i -= 1) {
		const randomIndex = Math.floor(Math.random() * (i + 1))
		const current = list[i]
		list[i] = list[randomIndex]!
		list[i] = current!
	}
	return list
}

function refreshOrder(): void {
	shuffledImages.value = shuffleList(activeFolder.value?.images || [])
}

function getFolderPath(id: string): { path: string, query: { c: string } } {
	return { path: '/gallery', query: { c: id } }
}

watch(activeFolderId, () => {
	if (!hydrated.value) {
		shuffledImages.value = [...(activeFolder.value?.images || [])]
		return
	}
	refreshOrder()
}, { immediate: true })

onMounted(() => {
	hydrated.value = true
	refreshOrder()
})

function backToFolders(): void {
	router.replace('/gallery')
}
</script>

<template>
<ZPageBanner :title :description :image />

<div class="gallery-page">
	<div v-if="!showingFolder" class="folder-panel">
		<header class="panel-head">
			<h2>分类</h2>
			<span>共 {{ gallery.length }} 个</span>
		</header>

		<div class="folder-grid">
			<NuxtLink
				v-for="folder in gallery"
				:key="folder.id"
				class="folder-card"
				:to="getFolderPath(folder.id)"
			>
				<div class="folder-cover">
					<NuxtImg
						class="cover-image"
						:src="folder.cover || getImageUrl(folder.images[0])"
						:alt="folder.name"
						loading="lazy"
					/>
				</div>

				<div class="folder-meta">
					<h3>{{ folder.name }}</h3>
					<p class="folder-count">
						{{ folder.images.length }} 张图片
					</p>
				</div>
			</NuxtLink>
		</div>
	</div>

	<div v-else class="images-panel">
		<header class="images-head">
			<button class="back-btn" @click="backToFolders">
				<Icon name="tabler:chevron-left" />
				返回分类
			</button>

			<div class="head-main">
				<h2>{{ activeFolder?.name }}</h2>
				<span>共 {{ shuffledImages.length }} 张</span>
			</div>
		</header>

		<div v-if="shuffledImages.length" class="image-grid">
			<article
				v-for="(pic, index) in shuffledImages"
				:key="`${getImageUrl(pic)}-${index}`"
				class="image-card"
			>
				<Pic
					class="image"
					:src="getImageUrl(pic)"
					:alt="getImageAlt(pic, index)"
				/>
			</article>
		</div>

		<p v-if="!shuffledImages.length" class="empty-tip">
			当前分类暂无图片。
		</p>
	</div>
</div>
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
	align-items: baseline;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;

	h2 {
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
	display: block;
	overflow: hidden;
	border-radius: .6rem;
	box-shadow: 0 0 0 1px var(--c-bg-soft);
	text-align: left;
	color: inherit;
	text-decoration: none;
	transition: transform var(--delay), box-shadow var(--delay);

	&:hover {
		transform: translateY(-2px);
	}

	.folder-cover {
		position: relative;
		overflow: hidden;
		aspect-ratio: 16 / 9;
	}

	.cover-image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.folder-meta {
		padding: .65rem .75rem;
		background-color: var(--ld-bg-card);

		h3 {
			margin: 0;
			font-size: .95rem;
		}

		.folder-count {
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

		h2 {
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
		background-color: var(--c-bg-soft);
		color: var(--c-text);
	}
}

.image-grid {
	column-count: 3;
	column-gap: .8rem;

	@media (max-width: $breakpoint-mobile) {
		column-count: 2;
	}
}

.image-card {
	overflow: hidden;
	margin-bottom: .8rem;
	border-radius: .6rem;
	box-shadow: 0 0 0 1px var(--c-bg-soft);
	transition: transform var(--delay), box-shadow var(--delay);
	break-inside: avoid;

	&:hover {
		transform: translateY(-2px);
	}

	.image {
		display: block;
		overflow: hidden;
		line-height: 0;

		:deep(img) {
			display: block;
			width: 100%;
			height: auto;
		}
	}
}

.empty-tip {
	margin: 2rem 0;
	text-align: center;
	color: var(--c-text-3);
}
</style>
