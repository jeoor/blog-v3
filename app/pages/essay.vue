<script setup lang="ts">
import type { EssayImage, EssayItem } from '~/types/essay'
import essays from '~/essays'
import { getFixedDelay } from '~/utils/anim'

const DATE_SLASH_RE = /\//g

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'tag-cloud', 'countdown'])

const { author } = useAppConfig()

const title = '即刻'
const description = '记录生活点滴，一些想法和自言自语。'
const image = '/banners/essay-banner.webp'
useSeoMeta({ title, description, ogImage: image })

const PAGE_SIZE = 20

const sortedEssays = essays
	.toSorted((a, b) => getEssaySortTime(b.date) - getEssaySortTime(a.date))

const displayCount = ref(PAGE_SIZE)
const displayedEssays = computed(() => sortedEssays.slice(0, displayCount.value))
const hasMore = computed(() => sortedEssays.length > displayCount.value)
const essayList = computed(() => displayedEssays.value.map((essay, index) => ({
	essay,
	index,
	key: getEssayKey(essay, index),
	images: essay.images?.map(normalizeEssayImage) || [],
})))

function getEssaySortTime(date: string): number {
	try {
		return toZonedTemporal(date).epochMilliseconds
	}
	catch {
		return 0
	}
}

function getEssayKey(essay: EssayItem, index: number): string {
	const marker = essay.text
		?? essay.linkCards?.[0]?.link
		?? essay.video?.id
		?? (typeof essay.images?.[0] === 'string' ? essay.images[0] : essay.images?.[0]?.src)
		?? ''

	return `${essay.date}-${marker}-${index}`
}

function replyEssay(content: string): void {
	const input = document.querySelector('#twikoo .tk-input textarea')
	if (!(input instanceof HTMLTextAreaElement)) {
		return
	}

	if (content.trim()) {
		const quotes = content.split('\n').map(str => `> ${str}`).join('\n')
		input.value = `${quotes}\n\n`
	}
	else {
		input.value = ''
	}
	input.dispatchEvent(new InputEvent('input'))

	const length = input.value.length
	input.setSelectionRange(length, length)
	input.focus()
}

function getEssayDate(date?: string | Date): string {
	if (!date) {
		return ''
	}

	const dateStr = typeof date === 'string' ? date : date.toISOString()
	return toZdtLocaleString(dateStr, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).replace(DATE_SLASH_RE, '-')
}

function normalizeEssayImage(image: EssayImage) {
	if (typeof image === 'string') {
		return { src: image }
	}

	return image
}

function getImageLayoutClass(images?: EssayImage[]): 'images--single' | 'images--multi' {
	return images && images.length > 1 ? 'images--multi' : 'images--single'
}
</script>

<template>
<ZPageBanner :title :description :image />

<div class="essay-list">
	<div
		v-for="{ essay, index, key, images } in essayList"
		:key="key"
		class="essay-item"
		:style="getFixedDelay(index * 0.05)"
	>
		<div class="essay-meta">
			<NuxtImg class="avatar" :src="author.avatar" :alt="author.name" />
			<div class="info">
				<div class="nick">
					{{ author.name }}
				</div>
				<div class="date">
					{{ getEssayDate(essay.date) }}
				</div>
			</div>
		</div>

		<div class="essay-content">
			<div v-if="essay.text" class="text" v-html="essay.text" />
			<div v-if="essay.linkCards?.length" class="link-cards">
				<LinkCard
					v-for="card in essay.linkCards"
					:key="card.link"
					class="essay-link-card"
					v-bind="card"
				/>
			</div>
			<div
				v-if="images.length"
				class="images"
				:class="getImageLayoutClass(essay.images)"
			>
				<Pic
					v-for="imageItem in images"
					:key="imageItem.src"
					class="image"
					:class="images.length > 1 ? 'image--multi' : 'image--single'"
					:src="imageItem.src"
					:alt="imageItem.alt"
					:width="imageItem.width"
					:height="imageItem.height"
				/>
			</div>
			<VideoEmbed v-if="essay.video" class="video" v-bind="essay.video" height="" />
		</div>

		<div class="essay-bottom">
			<div v-if="essay.tags?.length" class="tags">
				<span v-for="tag in essay.tags" :key="tag" class="tag">
					<Icon name="tabler:tag" />
					<span>{{ tag }}</span>
				</span>
			</div>
			<button v-tip="'评论'" class="comment-btn" @click="replyEssay(essay.text ?? '')">
				<Icon name="tabler:message-dots" />
			</button>
		</div>
	</div>

	<ZButton v-show="hasMore" class="btn-load-more gradient-card" text="加载更多" @click="displayCount += PAGE_SIZE" />
</div>

<PostComment />
</template>

<style lang="scss" scoped>
.essay-list {
	margin: 1rem;
	animation: float-in 0.2s backwards;

	.essay-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
		padding: 1rem;
		border-radius: 8px;
		box-shadow: 0 0 0 1px var(--c-bg-soft);
		animation: float-in 0.3s backwards;

		.essay-meta {
			display: flex;
			align-items: center;
			gap: 10px;

			.avatar {
				width: 3em;
				border-radius: 50%;
				box-shadow: 2px 4px 1rem var(--ld-shadow);

				@supports (corner-shape: squircle) {
					corner-shape: superellipse(1.2);
				}
			}

			.nick {
				display: flex;
				align-items: center;
				gap: 5px;
			}

			.date {
				font-family: var(--font-monospace);
				font-size: 0.8rem;
				color: var(--c-text-3);
			}
		}

		.essay-content {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
			line-height: 1.6;
			color: var(--c-text-2);

			.text :deep(a[href]) {
				margin: -0.1em -0.2em;
				padding: 0.1em 0.2em;
				background: linear-gradient(var(--c-primary-soft), var(--c-primary-soft)) no-repeat center bottom / 100% 0.1em;
				color: var(--c-primary);
				transition: all 0.2s;

				&:hover {
					border-radius: 0.3em;
					background-size: 100% 100%;
				}
			}

			.link-cards {
				display: flex;
				flex-direction: column;
				gap: 0.75rem;
			}

			.essay-link-card {
				align-self: center;
				width: 20rem;
				max-width: 90%;
				margin: 0 auto;
			}

			.images {
				display: grid;
				gap: 8px;
			}

			.images--multi {
				grid-template-columns: repeat(3, 1fr);
			}

			.image {
				overflow: hidden;
				border-radius: 8px;

				:deep(img) {
					transition: transform 0.3s;

					&:hover {
						transform: scale(1.05);
					}
				}
			}

			.image--multi {
				position: relative;
				padding-bottom: 100%;

				:deep(img) {
					display: block;
					position: absolute;
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
			}

			.image--single {
				justify-self: start;
				width: fit-content;
				max-width: min(100%, 26rem);

				:deep(img) {
					display: block;
					position: static;
					max-width: 100%;
					object-fit: contain;
				}
			}

			.video {
				margin: 0;
				border-radius: 8px;
			}
		}

		.essay-bottom {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 0.5rem;
			color: var(--c-text-3);

			.tags {
				display: flex;
				gap: 4px;
				font-size: 0.7rem;
			}

			.tag {
				display: flex;
				align-items: center;
				padding: 2px 4px;
				border-radius: 4px;
				background-color: var(--c-bg-2);
				transition: all 0.2s;
				cursor: pointer;

				&:hover {
					opacity: 0.8;
				}
			}

			.tag .tabler-tag + * {
				margin-left: 0.15em;
			}

			.comment-btn {
				margin-left: auto;
			}
		}
	}
}
</style>
