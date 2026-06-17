<script setup lang="tsx">
import type { TippyComponent } from 'vue-tippy'
import { LazyPopoverLightbox } from '#components'

const appConfig = useAppConfig()
const modalStore = useModalStore()

const commentEl = useTemplateRef('comment')
const popoverEl = useTemplateRef<TippyComponent>('popover')
const popoverJumpTo = ref('')
const popoverInputEl = useTemplateRef('popover-input')
const showUndo = ref(false)

const popoverBind = ref<TippyComponent['$props']>({})

/** 评论区链接守卫 与 评论图片放大 */
useEventListener(commentEl, 'click', (e) => {
	if (!(e.target instanceof Element))
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

	popoverJumpTo.value = safelyDecodeUriComponent(popoverTarget.href)
	popoverBind.value = {
		getReferenceClientRect: () => popoverTarget.getBoundingClientRect(),
		triggerTarget: popoverTarget,
	}

	nextTick(checkUndoable)
	popoverEl.value?.show()
}, { capture: true })

function checkUndoable() {
	showUndo.value = popoverInputEl.value?.textContent !== popoverJumpTo.value
}

function undo() {
	if (!popoverInputEl.value)
		return
	popoverInputEl.value.textContent = popoverJumpTo.value
	checkUndoable()
}

function confirmOpen() {
	window.open(popoverInputEl.value?.textContent, '_blank')
}

function isOwoEmotionImage(img: HTMLImageElement) {
	const marker = `${img.alt || ''} ${img.title || ''}`.trim()

	return img.classList.contains('tk-owo-emotion')
		|| !!img.closest('.tk-owo-emotion')
		|| /^:.+:$/.test(marker)
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

function escapeSelectorValue(value: string) {
	return value
		.replace(/\\/g, '\\\\')
		.replace(/"/g, '\\"')
}

function findCommentTarget(id: string): HTMLElement | null {
	if (!id)
		return null

	const byId = document.getElementById(id)
	if (byId instanceof HTMLElement && byId.closest('#twikoo'))
		return byId

	const safeId = escapeSelectorValue(id)

	const selectors = [
		`#twikoo [data-id="${safeId}"]`,
		`#twikoo [data-key="${safeId}"]`,
		`#twikoo [data-comment-id="${safeId}"]`,
		`#twikoo [id$="${safeId}"]`,
		`#twikoo [data-id$="${safeId}"]`,
		`#twikoo [data-key$="${safeId}"]`,
	]

	for (const selector of selectors) {
		try {
			const el = document.querySelector<HTMLElement>(selector)
			if (el)
				return el
		}
		catch {}
	}

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
				<span
					ref="popover-input"
					class="input"
					contenteditable="plaintext-only"
					spellcheck="false"
					@input="checkUndoable"
					@keydown.enter.prevent="confirmOpen"
					v-text="popoverJumpTo"
				/>

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

<style lang="scss" scoped>
#twikoo > p {
	padding: 2rem;
	text-align: center;
	color: var(--c-text-3);
	animation: float-in 0.2s;

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

:deep() > [data-tippy-root] > .tippy-box {
	padding: 0;
}

.popover-confirm {
	display: flex;
	align-items: center;
	overflow-wrap: anywhere;

	> .input {
		min-width: 0;
		padding: 0.3em 0.6em;
		outline: none;
	}

	> button {
		flex-shrink: 0;
		align-self: stretch;
		padding: 0.3em;
		border-radius: 0 0.5em 0.5em 0;
	}
}

// ====== Twikoo 评论区 ======
:deep(#twikoo) {
	// 管理面板
	.tk-admin-container {
		position: fixed;
		z-index: calc(var(--z-index-popover) + 1);
	}

	// 头像
	.tk-avatar {
		overflow: hidden;
		border-radius: 50%;

		@supports (corner-shape: squircle) {
			corner-shape: superellipse(1.2);
		}

		&.tk-clickable {
			cursor: auto;
		}
	}

	// ====== 提交区布局：输入框 → 信息栏 → 按钮 ======
	.tk-submit {
		display: flex;
		flex-direction: column;

		.tk-avatar,
		a.tk-submit-action-icon.__markdown { display: none; }

		.tk-preview-container {
			order: 4;
			margin: 0.5rem 0;
		}

		.tk-row.actions {
			justify-content: flex-end;
			order: 3;
			margin: 0 0 0.5rem;
		}

		.tk-input {
			order: 1;
			margin-bottom: 0.5rem;
			font-family: var(--font-monospace);

			.el-textarea__inner {
				padding: 0.8rem;
				border: 1px solid var(--c-border);
				border-radius: var(--comment-control-radius);
				background-color: var(--c-bg-2);
				transition: border-color 0.2s;

				&:focus {
					border-color: var(--c-primary);
				}
			}
		}

		.tk-meta-input {
			order: 2;

			.el-input-group {
				border: 1px solid var(--c-border);
				border-radius: var(--comment-control-radius);
				background: var(--c-bg-2);
				transition: border-color 0.2s;

				&:focus-within { border-color: var(--c-primary); }
			}

			.el-input__inner { border: none; }

			.el-input-group__prepend {
				border: none;
				border-radius: var(--comment-control-radius) 0 0 var(--comment-control-radius);
				background: var(--c-bg-1);
				color: var(--c-text-2);
			}
		}
	}

	// 按钮
	.tk-preview, .tk-cancel {
		border: 1px solid var(--c-bg-soft);
		border-radius: var(--comment-control-radius);
		background-color: var(--ld-bg-card);
		color: var(--c-text-1);
		transition: background-color 0.2s;

		&:hover { background-color: var(--c-bg-2); }
	}

	.tk-send {
		border: 1px solid var(--c-primary);
		border-radius: var(--comment-control-radius);
		background-color: var(--c-primary);
		color: var(--c-bg);
		transition: background-color 0.2s;

		&:hover { opacity: 0.85; }
	}

	// 表情面板
	.OwO .OwO-logo {
		border: 1px solid var(--c-bg-soft);
		border-radius: var(--comment-control-radius);
		background-color: var(--c-bg-2);
		color: var(--c-text-2);
		transition: background-color 0.2s, color 0.2s, border-color 0.2s;

		&:hover {
			border-color: var(--c-primary);
			background-color: var(--c-bg-3);
		}
	}

	.OwO .OwO-body {
		overflow: hidden;
		border: 1px solid var(--c-bg-soft);
		border-radius: var(--comment-control-radius);
		background-color: var(--ld-bg-card);
		color: var(--c-text);

		.OwO-items { padding: 0.4rem; }

		.OwO-item {
			border-radius: calc(var(--comment-control-radius) - 0.125rem);
			transition: transform 0.2s;

			&:hover {
				transform: scale(1.2);
			}
		}

		.OwO-bar {
			border-top: 1px solid var(--c-border);
			background-color: var(--c-bg-2);
		}

		.OwO-packages {
			padding: 0.25rem;

			li {
				border-radius: calc(var(--comment-control-radius) - 0.125rem);
				color: var(--c-text-2);
				transition: background-color 0.2s, color 0.2s;

				&:hover {
					background-color: var(--c-bg-3);
					color: var(--c-text);
				}
			}

			.OwO-package-active,
			li[aria-selected="true"] {
				background-color: var(--c-primary-soft);
				color: var(--c-text);
			}
		}
	}

	// ====== 评论内容 ======
	.tk-comments-title, .tk-nick > strong {
		font-family: var(--font-creative);
	}

	.tk-nick-link { color: var(--c-primary); }
	.tk-time { color: var(--c-text-3); }

	.tk-comment .tk-main {
		.tk-meta { margin-bottom: 0.3rem; }

		.tk-extras {
			margin-top: 0.5rem;
			font-size: 0.75rem;
			color: var(--c-text-3);
		}

		.tk-action .tk-action-link:first-child { display: none; }
	}

	// 内容区
	.tk-content {
		overflow-wrap: anywhere;
		margin-top: 0;
		font-size: 0.95rem;
		line-height: 1.6;
	}

	// 回复折叠
	.tk-replies:not(.tk-replies-expand) {
		mask-image: linear-gradient(#FFF 50%, transparent);
	}

	// 加载更多
	.tk-expand {
		padding: 0.375rem 1rem;
		border-radius: var(--comment-control-radius);
		background-color: var(--c-bg-2);
		color: var(--c-text-1);
		transition: background-color 0.2s;

		&:hover { background-color: var(--c-bg-3); }
	}

	.tk-footer {
		font-size: 0.7rem;
		color: var(--c-text-3);
	}

	.tippy-svg-arrow > svg {
		fill: inherit;
		width: auto;
		height: auto;
	}
}

// ====== 评论内容富文本 ======
:deep(:where(.tk-preview-container, .tk-content)) {
	pre {
		overflow: auto;
		max-width: 100%;
		border-radius: var(--comment-control-radius);
		font-size: 0.8125rem;
	}

	a {
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

	p {
		margin: 0.2em 0;
	}

	img:not(.tk-owo-emotion, [alt^=":"][alt$=":"], [title^=":"][title$=":"]) {
		width: auto;
		height: auto;
		max-width: min(100%, 28rem);
		max-height: 28rem;
		border-radius: 0.5em;
	}

	.tk-owo-emotion,
	img[alt^=":"][alt$=":"],
	img[title^=":"][title$=":"] {
		display: inline-block;
		width: 4em;
		height: auto;
		vertical-align: middle;
		cursor: auto;
	}

	menu, ol, ul {
		margin: 0.5em 0;
		padding-inline-start: 1.5em;
		font-size: 0.9rem;
		list-style: revert;

		> li {
			margin: 0.2em 0;
			&::marker { color: var(--c-primary); }
		}
	}

	blockquote {
		margin: 0.5rem 0 0.8rem;
		padding: 0.6rem 0.8rem;
		border-left: 3px solid var(--c-border);
		border-radius: 0.2rem;
		background: var(--c-bg-2);
		font-size: 0.9rem;
		color: var(--c-text-2);
	}
}

:deep(.tk-content img:not(.tk-owo-emotion, [alt^=":"][alt$=":"], [title^=":"][title$=":"])) {
	cursor: zoom-in;
}
</style>
