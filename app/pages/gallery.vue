<script setup lang="ts">
import type { GalleryImage } from '~/types/gallery'
import { LazyPopoverLightbox } from '#components'
import gallery from '~/gallery'

const appConfig = useAppConfig()
const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'countdown'])

const route = useRoute()
const router = useRouter()
const galleryPage = useTemplateRef<HTMLElement>('galleryPage')
const modalStore = useModalStore()

const title = '相册'
const description = '用镜头记录生活。'
const image = '/assets/gallery-banner.webp'
const ogImage = new URL(image, appConfig.url).href
useSeoMeta({ title, description, ogImage })

const activeFolderId = ref('')
const shuffledImages = ref<GalleryImage[]>([])
const hydrated = ref(false)
const viewerIndex = ref(-1)
const viewerTargetEl = ref<HTMLImageElement>()

function applyFolderFromRoute(value: string | string[] | undefined) {
	const targetRaw = Array.isArray(value) ? value[0] : value
	const target = targetRaw || ''
	if (!target) {
		activeFolderId.value = ''
		return
	}

	const exists = gallery.some(folder => folder.id === target)
	activeFolderId.value = exists ? target : ''
}

watch(() => route.query.c, (value) => {
	if (!hydrated.value)
		return

	applyFolderFromRoute(value as string | string[] | undefined)
})

const activeFolder = computed(() => gallery.find(folder => folder.id === activeFolderId.value))
const showingFolder = computed(() => Boolean(activeFolder.value))

function getImageUrl(image?: GalleryImage) {
	if (!image)
		return ''
	return typeof image === 'string' ? image : image.url
}

function getImageAlt(image: GalleryImage, index: number) {
	if (typeof image !== 'string' && image.title)
		return image.title
	return `${activeFolder.value?.name || '相册'}-${index + 1}`
}

const viewerCaption = computed(() => {
	const image = shuffledImages.value[viewerIndex.value]
	if (!image)
		return ''
	return getImageAlt(image, viewerIndex.value)
})

const {
	open: openLightbox,
	close: closeLightbox,
	status: lightboxStatus,
} = modalStore.use(
	() => h(LazyPopoverLightbox, {
		el: viewerTargetEl.value as HTMLImageElement,
		caption: viewerCaption.value,
	}),
	{ unique: true },
)

const viewerOpen = computed(() => lightboxStatus.value === 'open')
const hasViewerNav = computed(() => shuffledImages.value.length > 1)

function getImageElement(index: number) {
	return galleryPage.value?.querySelector<HTMLImageElement>(`.image-card[data-viewer-index="${index}"] img`) || null
}

function openViewer(index: number, e?: MouseEvent) {
	const targetFromClick = e?.currentTarget instanceof HTMLElement
		? e.currentTarget.querySelector<HTMLImageElement>('img')
		: null
	const imageEl = targetFromClick || getImageElement(index)
	if (!imageEl)
		return

	viewerIndex.value = index
	viewerTargetEl.value = imageEl
	openLightbox()
}

function closeViewer() {
	viewerIndex.value = -1
	if (lightboxStatus.value !== 'closed')
		closeLightbox()
}

function goPrevViewer() {
	const total = shuffledImages.value.length
	if (!total)
		return
	const next = (viewerIndex.value - 1 + total) % total
	viewerIndex.value = next
	const nextImage = getImageElement(next)
	if (nextImage)
		viewerTargetEl.value = nextImage
}

function goNextViewer() {
	const total = shuffledImages.value.length
	if (!total)
		return
	const next = (viewerIndex.value + 1) % total
	viewerIndex.value = next
	const nextImage = getImageElement(next)
	if (nextImage)
		viewerTargetEl.value = nextImage
}

function shuffleImages(images: GalleryImage[]) {
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
	if (!hydrated.value) {
		shuffledImages.value = []
		closeViewer()
		return
	}

	refreshOrder()
	closeViewer()
}, { immediate: true })

watch(shuffledImages, (images) => {
	if (viewerIndex.value >= images.length)
		closeViewer()
})

watch(lightboxStatus, (status) => {
	if (status === 'closed')
		viewerIndex.value = -1
})

onMounted(() => {
	hydrated.value = true
	applyFolderFromRoute(route.query.c as string | string[] | undefined)
	refreshOrder()
})

useEventListener('keydown', (e) => {
	if (!viewerOpen.value)
		return

	if (e.key === 'ArrowLeft') {
		e.preventDefault()
		goPrevViewer()
	}
	else if (e.key === 'ArrowRight') {
		e.preventDefault()
		goNextViewer()
	}
})

function openFolder(id: string) {
	router.replace({
		path: '/gallery',
		query: { c: id },
	})
}

function backToFolders() {
	closeViewer()
	router.replace('/gallery')
}
</script>

<template>
<ZPageBanner :title :description :image />

<section ref="galleryPage" class="gallery-page">
	<div v-if="!showingFolder" class="folder-panel">
		<header class="panel-head">
			<h3>分类</h3>
			<span>共 {{ gallery.length }} 个</span>
		</header>

		<div class="folder-grid">
			<button
				v-for="folder in gallery"
				:key="folder.id"
				class="folder-card"
				@click="openFolder(folder.id)"
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
					<h4>{{ folder.name }}</h4>
					<p class="folder-count">
						{{ folder.images.length }} 张图片
					</p>
				</div>
			</button>
		</div>
	</div>

	<div v-else class="images-panel">
		<header class="images-head">
			<button class="back-btn" @click="backToFolders">
				<Icon name="ph:caret-left-bold" />
				返回分类
			</button>

			<div class="head-main">
				<h3>{{ activeFolder?.name }}</h3>
				<span>共 {{ shuffledImages.length }} 张</span>
			</div>
		</header>

		<div v-if="shuffledImages.length" class="image-grid">
			<article
				v-for="(pic, index) in shuffledImages"
				:key="`${getImageUrl(pic)}-${index}`"
				:data-viewer-index="index"
				class="image-card"
				@click="openViewer(index, $event)"
			>
				<Pic
					class="image"
					:src="getImageUrl(pic)"
					:alt="getImageAlt(pic, index)"
					:zoom="false"
				/>
			</article>
		</div>

		<button
			v-if="viewerOpen && hasViewerNav"
			class="lightbox-nav prev"
			aria-label="上一张"
			title="上一张 (←)"
			@click="goPrevViewer"
		>
			<Icon name="ph:caret-left-bold" />
		</button>

		<button
			v-if="viewerOpen && hasViewerNav"
			class="lightbox-nav next"
			aria-label="下一张"
			title="下一张 (→)"
			@click="goNextViewer"
		>
			<Icon name="ph:caret-right-bold" />
		</button>

		<p v-if="!shuffledImages.length" class="empty-tip">
			当前分类暂无图片。
		</p>
	</div>
</section>
</template>

<style lang="scss" scoped>
.gallery-page {
	margin: 1rem;
	animation: float-in 0.2s backwards;
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

	h3 {
		margin: 0;
		font: inherit;
		font-weight: 700;
	}

	span {
		font-size: 0.85rem;
		color: var(--c-text-3);
	}
}

.folder-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	gap: 0.8rem;

	@media (max-width: $breakpoint-mobile) {
		grid-template-columns: 1fr;
	}
}

.folder-card {
	overflow: hidden;
	border-radius: 0.6rem;
	box-shadow: 0 0 0 1px var(--c-bg-soft);
	text-align: left;
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
		padding: 0.65rem 0.75rem;
		background-color: var(--ld-bg-card);

		h4 {
			margin: 0;
			font-size: 0.95rem;
		}

		.folder-count {
			margin: 0.25rem 0 0;
			font-size: 0.82rem;
			color: var(--c-text-3);
		}
	}
}

.images-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.8rem;
	margin-bottom: 1rem;

	@media (max-width: $breakpoint-mobile) {
		flex-wrap: wrap;
	}

	.head-main {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		margin-inline-end: auto;

		h3 {
			margin: 0;
			font-size: 1.05rem;
		}

		span {
			font-size: 0.85rem;
			color: var(--c-text-3);
		}
	}
}

.back-btn {
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.35rem 0.6rem;
	border-radius: 0.45rem;
	font-size: 0.8rem;
	color: var(--c-text-2);
	transition: color var(--delay), background-color var(--delay);

	&:hover {
		background-color: var(--c-bg-soft);
		color: var(--c-text);
	}
}

.image-grid {
	column-count: 3;
	column-gap: 0.8rem;

	@media (max-width: $breakpoint-mobile) {
		column-count: 2;
	}
}

.image-card {
	overflow: hidden;
	margin-bottom: 0.8rem;
	border-radius: 0.6rem;
	box-shadow: 0 0 0 1px var(--c-bg-soft);
	transition: transform var(--delay), box-shadow var(--delay);
	cursor: zoom-in;
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

.lightbox-nav {
	display: grid;
	place-items: center;
	position: fixed;
	top: 50%;
	width: 2.5rem;
	height: 2.5rem;
	border: 1px solid var(--c-border);
	border-radius: 0.5em;
	box-shadow: var(--box-shadow-2), var(--box-shadow-3);
	background-color: var(--c-bg-a80);
	backdrop-filter: blur(1rem) saturate(2);
	color: var(--c-text-2);
	transform: translateY(-50%);
	transition: all var(--delay);
	z-index: 513;

	&.prev {
		inset-inline-start: clamp(0.75rem, 3.5vw, 3rem);
	}

	&.next {
		inset-inline-end: clamp(0.75rem, 3.5vw, 3rem);
	}

	&:hover {
		color: var(--c-text);
	}
}

@media (max-width: $breakpoint-mobile) {
	.lightbox-nav {
		width: 2.25rem;
		height: 2.25rem;

		&.prev {
			inset-inline-start: max(0.5rem, env(safe-area-inset-left));
		}

		&.next {
			inset-inline-end: max(0.5rem, env(safe-area-inset-right));
		}
	}
}

.empty-tip {
	margin: 2rem 0;
	text-align: center;
	color: var(--c-text-3);
}
</style>
