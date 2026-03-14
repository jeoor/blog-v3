<script setup lang="ts">
import type { WidgetName } from '~/composables/useWidgets'
import { defineAsyncComponent } from 'vue'

definePageMeta({
	key: route => route.path,
})

type IdleWindow = Window & typeof globalThis

const route = useRoute()
const PostCommentAsync = defineAsyncComponent(() => import('~/components/post/Comment.vue'))
const commentAnchor = useTemplateRef<HTMLElement>('comment-anchor')
const shouldRenderComment = ref(false)

const layoutStore = useLayoutStore()
const articleAsidePlaceholder: WidgetName[] = ['empty']
const defaultArticleAside: WidgetName[] = ['toc']

layoutStore.setAside(articleAsidePlaceholder)

const { data: post } = await useAsyncData(
	route.path,
	() => queryCollection('content').path(route.path).first(),
)

useOptionalKatexStyles(post)

const contentStore = useContentStore()
const { toc, meta } = storeToRefs(contentStore)

const excerpt = computed(() => post.value?.description || '')
const articleAsideWidgets = computed<WidgetName[]>(() => (post.value?.meta?.aside as WidgetName[] | undefined) ?? defaultArticleAside)
const browser = import.meta.client ? globalThis as IdleWindow : undefined

let asideRestoreId: number | undefined
let commentObserver: IntersectionObserver | undefined
let commentRenderQueued = false

function setTocAndMeta() {
	toc.value = post.value?.body.toc
	meta.value = post.value?.meta
}

function restoreAside() {
	asideRestoreId = undefined
	if (post.value)
		layoutStore.setAside(articleAsideWidgets.value)
}

function scheduleAsideRestore() {
	if (!browser || !post.value)
		return

	if (typeof browser.requestIdleCallback === 'function') {
		asideRestoreId = browser.requestIdleCallback(restoreAside, { timeout: 1200 })
		return
	}

	asideRestoreId = browser.setTimeout(restoreAside, 300)
}

function clearAsideRestore() {
	if (!browser || asideRestoreId === undefined)
		return

	if (typeof browser.cancelIdleCallback === 'function') {
		browser.cancelIdleCallback(asideRestoreId)
	}
	else {
		browser.clearTimeout(asideRestoreId)
	}

	asideRestoreId = undefined
}

function showCommentSection() {
	if (shouldRenderComment.value || commentRenderQueued)
		return

	commentObserver?.disconnect()
	commentObserver = undefined
	commentRenderQueued = true

	queueMicrotask(() => {
		commentRenderQueued = false
		shouldRenderComment.value = true
	})
}

setTocAndMeta()

if (post.value) {
	useSeoMeta({
		title: post.value.title,
		ogType: 'article',
		ogImage: post.value.image,
		description: post.value.description,
	})
}
else {
	const event = useRequestEvent()
	event && setResponseStatus(event, 404)
	route.meta.title = '页面不存在'
	layoutStore.setAside(['blog-tech'])
}

if (import.meta.client) {
	onMounted(() => {
		scheduleAsideRestore()

		if (!post.value?.comment)
			return

		if (!commentAnchor.value) {
			shouldRenderComment.value = true
			return
		}

		if (typeof browser.IntersectionObserver !== 'function') {
			shouldRenderComment.value = true
			return
		}

		commentObserver = new browser.IntersectionObserver((entries) => {
			if (entries.some(entry => entry.isIntersecting))
				showCommentSection()
		}, { rootMargin: '480px 0px' })

		commentObserver.observe(commentAnchor.value)
	})

	onBeforeUnmount(() => {
		clearAsideRestore()
		commentObserver?.disconnect()
	})
}

if (import.meta.dev) {
	watchEffect(() => {
		setTocAndMeta()
	})
}
</script>

<template>
<template v-if="post">
	<PostHeader v-bind="post" />
	<PostExcerpt v-if="excerpt" :excerpt />
	<!-- 使用 float-in 动画会导致搜索跳转不准确 -->
	<ContentRenderer
		class="article"
		:class="getPostTypeClassName(post?.type, { prefix: 'md' })"
		:value="post"
		tag="article"
	/>

	<PostFooter v-if="post.postfooter" v-bind="post" />
	<PostDonation v-if="post.donation" />
	<PostSurround />

	<div v-if="post.comment" ref="comment-anchor" class="comment-section">
		<button v-if="!shouldRenderComment" class="comment-entry card" @click="showCommentSection()">
			展开评论区
		</button>
		<PostCommentAsync v-else />
	</div>
</template>

<ZError
	v-else
	icon="solar:confounded-square-bold-duotone"
	title="内容为空或页面不存在"
/>
</template>

<style lang="scss" scoped>
.comment-section {
	margin-top: 2rem;
}

.comment-entry {
	display: block;
	width: min(100%, 20rem);
	margin: 0 auto;
	padding: 0.9rem 1rem;
	border-radius: 0.75rem;
	color: var(--c-text-2);
	transition: transform 0.2s, box-shadow 0.2s;

	&:hover {
		box-shadow: var(--box-shadow-1);
		transform: translateY(-1px);
	}
}
</style>
