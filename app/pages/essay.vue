<script setup lang="ts">
import type { EssayImage, EssayItem } from '~/types/essay'
import essays from '~/essays'

const DATE_SLASH_RE = /\//g

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'tag-cloud', 'countdown'])

const { author } = useAppConfig()

const title = '即刻'
const description = '记录生活点滴，一些想法。'
const image = '/assets/essay-banner.webp'
useSeoMeta({ title, description, ogImage: image })

const PAGE_SIZE = 20

const sortedEssays = essays
	.toSorted((a, b) => getEssaySortTime(b.date) - getEssaySortTime(a.date))

const displayCount = ref(PAGE_SIZE)
const displayedEssays = computed(() => sortedEssays.slice(0, displayCount.value))
const hasMore = computed(() => sortedEssays.length > displayCount.value)

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
	<div v-for="(essay, index) in displayedEssays" :key="getEssayKey(essay, index)" class="essay-item">
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
				v-if="essay.images?.length"
				class="images"
				:class="getImageLayoutClass(essay.images)"
			>
				<Pic
					v-for="imageItem in essay.images.map(normalizeEssayImage)"
					:key="imageItem.src"
					class="image"
					:class="essay.images.length > 1 ? 'image--multi' : 'image--single'"
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

	<ZButton v-show="hasMore" class="btn-load-more gradient-card" @click="displayCount += PAGE_SIZE" text="加载更多" />
</div>

<PostComment />
</template>

<style lang="scss" scoped>
.essay-list {
	animation: float-in .2s backwards;
	margin: 1rem;

	.essay-item {
		animation: float-in .3s backwards;
		animation-delay: var(--delay);
		border-radius: 8px;
		box-shadow: 0 0 0 1px var(--c-bg-soft);
		display: flex;
		flex-direction: column;
		gap: .5rem;
		margin-bottom: 1rem;
		padding: 1rem;

		.essay-meta {
			align-items: center;
			display: flex;
			gap: 10px;

			.avatar {
				border-radius: 50%;
				box-shadow: 2px 4px 1rem var(--ld-shadow);
				width: 3em;

				@supports (corner-shape: squircle) {
					corner-shape: superellipse(1.2);
				}
			}

			.nick {
				align-items: center;
				display: flex;
				gap: 5px;
			}

			.date {
				color: var(--c-text-3);
				font-family: var(--font-monospace);
				font-size: .8rem;
			}
		}

		.essay-content {
			color: var(--c-text-2);
			display: flex;
			flex-direction: column;
			gap: .5rem;
			line-height: 1.6;

			.text :deep(a[href]) {
				margin: -.1em -.2em;
				padding: .1em .2em;
				background: linear-gradient(var(--c-primary-soft), var(--c-primary-soft)) no-repeat center bottom / 100% .1em;
				color: var(--c-primary);
				transition: all .2s;

				&:hover {
					border-radius: .3em;
					background-size: 100% 100%;
				}
			}

			.link-cards {
				display: flex;
				flex-direction: column;
				gap: .75rem;
			}

			.essay-link-card {
				align-self: center;
				margin: 0 auto;
				max-width: 90%;
				width: 20rem;
			}

			.images {
				display: grid;
				gap: 8px;
			}

			.images--multi {
				grid-template-columns: repeat(3, 1fr);
			}

			.image {
				border-radius: 8px;
				overflow: hidden;

				:deep(img) {
					transition: transform .3s;

					&:hover {
						transform: scale(1.05);
					}
				}
			}

			.image--multi {
				padding-bottom: 100%;
				position: relative;

				:deep(img) {
					display: block;
					height: 100%;
					object-fit: cover;
					position: absolute;
					width: 100%;
				}
			}

			.image--single {
				justify-self: start;
				max-width: min(100%, 26rem);
				width: fit-content;

				:deep(img) {
					display: block;
					max-width: 100%;
					object-fit: contain;
					position: static;
				}
			}

			.video {
				border-radius: 8px;
				margin: 0;
			}
		}

		.essay-bottom {
			align-items: center;
			color: var(--c-text-3);
			display: flex;
			gap: .5rem;
			justify-content: space-between;

			.tags {
				display: flex;
				font-size: .7rem;
				gap: 4px;
			}

			.tag {
				align-items: center;
				background-color: var(--c-bg-2);
				border-radius: 4px;
				cursor: pointer;
				display: flex;
				padding: 2px 4px;
				transition: all .2s;

				&:hover {
					opacity: .8;
				}
			}

			.tag .tabler-tag + * {
				margin-left: .15em;
			}

			.comment-btn {
				margin-left: auto;
			}
		}
	}
}
</style>
