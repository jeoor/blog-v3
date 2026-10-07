<script setup lang="tsx">
import type { TippyComponent } from 'vue-tippy'
import { LazyPopoverLightbox } from '#components'

const appConfig = useAppConfig()
const modalStore = useModalStore()

const commentEl = useTemplateRef('comment')
const popoverEl = useTemplateRef<TippyComponent>('popover')
const popoverJumpTo = ref('')
const popoverInput = ref('')
const showUndo = computed(() => popoverInput.value !== popoverJumpTo.value)

const popoverBind = ref<TippyComponent['$props']>({})

/** 评论区链接守卫 与 评论图片放大 */
useEventListener(commentEl, 'click', (e) => {
	if (!(e.target instanceof Element))
		return

	if (e.target.closest('.popover-confirm'))
		return

	if (isCommentLightboxImage(e.target)) {
		const imgEl = e.target
		e.preventDefault()
		modalStore.use(
			() => h(LazyPopoverLightbox, { el: imgEl, caption: imgEl.alt || '' }),
			{ unique: true },
		).open()
		return
	}

	if (e.target.matches('.tk-avatar-img'))
		e.stopPropagation()

	const popoverTarget = e.target.closest('a[target="_blank"]')
	if (!(popoverTarget instanceof HTMLAnchorElement))
		return

	e.preventDefault()
	popoverEl.value?.hide()

	popoverJumpTo.value = popoverTarget.href
	popoverInput.value = popoverTarget.href
	popoverBind.value = {
		getReferenceClientRect: () => popoverTarget.getBoundingClientRect(),
		triggerTarget: popoverTarget,
	}

	popoverEl.value?.show()
}, { capture: true })

function undo() {
	popoverInput.value = popoverJumpTo.value
}

function confirmOpen() {
	const raw = popoverInput.value.trim()
	if (!raw)
		return

	try {
		const url = new URL(raw)

		if (!['http:', 'https:'].includes(url.protocol))
			return

		window.open(url.href, '_blank', 'noopener,noreferrer')
		popoverEl.value?.hide()
	}
	catch {
		// ignore invalid URL
	}
}

const isOwoMarker = (value: string) => /^:[^\s:]+:$/.test(value.trim())

function isOwoEmotionImage(img: HTMLImageElement) {
	return img.classList.contains('tk-owo-emotion')
		|| !!img.closest('.tk-owo-emotion')
		|| isOwoMarker(img.alt || '')
		|| isOwoMarker(img.title || '')
}

function isCommentLightboxImage(target: Element): target is HTMLImageElement {
	return target instanceof HTMLImageElement
		&& !!target.closest('.tk-content')
		&& !isOwoEmotionImage(target)
}

let commentJumpTimer: ReturnType<typeof setInterval> | undefined
let commentJumpObserver: MutationObserver | undefined

function getCommentHash() {
	const raw = (window.location.hash || '').replace(/^#/, '')
	if (!raw)
		return ''

	try {
		return decodeURIComponent(raw)
	}
	catch {
		return raw
	}
}

function findCommentTarget(id: string): HTMLElement | null {
	if (!id)
		return null

	const root = document.getElementById('twikoo')
	if (!root)
		return null

	const byId = document.getElementById(id)
	if (byId instanceof HTMLElement && root.contains(byId))
		return byId

	return null
}

function jumpToCommentByHash(): boolean {
	const hash = getCommentHash()
	if (!hash)
		return false

	const target = findCommentTarget(hash)
	if (!target)
		return false

	const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

	target.scrollIntoView({
		behavior: prefersReducedMotion ? 'auto' : 'smooth',
		block: 'center',
	})

	return true
}

function stopCommentHashJump() {
	if (commentJumpTimer) {
		clearInterval(commentJumpTimer)
		commentJumpTimer = undefined
	}

	commentJumpObserver?.disconnect()
	commentJumpObserver = undefined
}

function startCommentHashJump() {
	stopCommentHashJump()

	if (!getCommentHash())
		return

	if (jumpToCommentByHash())
		return

	let count = 0

	commentJumpTimer = setInterval(() => {
		count++

		if (jumpToCommentByHash() || count > 60)
			stopCommentHashJump()
	}, 250)

	const root = commentEl.value || document.getElementById('twikoo') || document.body

	commentJumpObserver = new MutationObserver(() => {
		if (jumpToCommentByHash())
			stopCommentHashJump()
	})

	commentJumpObserver.observe(root, {
		childList: true,
		subtree: true,
	})
}

onMounted(() => {
	window.twikoo?.init?.({
		envId: appConfig.twikoo?.envId,
		// twikoo 会把挂载后的元素变为 #twikoo
		el: '#twikoo',
	})

	startCommentHashJump()
	window.addEventListener('hashchange', startCommentHashJump)
})

onBeforeUnmount(() => {
	stopCommentHashJump()
	window.removeEventListener('hashchange', startCommentHashJump)
})
</script>

<template>
<section ref="comment" class="z-comment">
	<h3 class="text-creative">
		评论区
	</h3>

	<!-- interactive 默认会把气泡移动到 triggerTarget 的父元素上 -->
	<Tooltip
		ref="popover"
		v-bind="popoverBind"
		:append-to="() => commentEl!"
		interactive
		:aria="{ expanded: false }"
		trigger="focusin"
	>
		<template #content>
			<div class="popover-confirm">
				<input
					v-model="popoverInput"
					class="input"
					type="url"
					spellcheck="false"
					@keydown.enter.prevent="confirmOpen"
				>

				<button
					v-if="showUndo"
					aria-label="恢复原始内容"
					@click="undo()"
				>
					<Icon name="tabler:arrow-back-up" />
				</button>

				<ZButton
					primary
					text="访问"
					@click="confirmOpen"
				/>
			</div>
		</template>
	</Tooltip>

	<div id="twikoo">
		<p>评论加载中...</p>
	</div>
</section>
</template>

<style scoped>
#twikoo > p {
	padding: 2rem;
	text-align: center;
	color: var(--c-text-3);
	animation: float-in var(--motion-fade-duration);

	&::before {
		content: "";
		display: block;
		width: 8px;
		height: 8px;
		margin: 0 auto 0.75rem;
		border-radius: 50%;
		background: var(--c-primary);
		animation: dot-breathe 1.5s ease-in-out infinite;
	}
}

@keyframes dot-breathe {
	0%, 100% {
		opacity: 0.4;
		transform: scale(0.6);
	}

	50% {
		opacity: 1;
		transform: scale(1);
	}
}

.z-comment {
	--comment-control-radius: 0.5rem;

	margin: 2rem auto;
	padding: 0 1rem;

	> h3 {
		margin-top: 3rem;
		font-size: 1.25rem;
	}
}

:deep([data-tippy-root] > .tippy-box) {
	padding: 0;
}

.popover-confirm {
	display: flex;
	align-items: center;
	overflow-wrap: anywhere;

	> .input {
		flex: 1;
		min-width: 0;
		padding: 0.3em 0.6em;
		border: none;
		outline: none;
		background: transparent;
		font: inherit;
		color: inherit;
	}

	> button {
		flex-shrink: 0;
		align-self: stretch;
		padding: 0.3em;
		border-radius: 0 var(--comment-control-radius) var(--comment-control-radius) 0;
	}
}
</style>

<style scoped src="@/assets/css/twikoo.css"></style>
