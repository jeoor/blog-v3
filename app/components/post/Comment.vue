<script setup lang="tsx">
import type { TippyComponent } from 'vue-tippy'
import { LazyPopoverLightbox } from '#components'

const props = withDefaults(defineProps<{
	initialReply?: string
	focusSeq?: number
	warmupMode?: 'visible' | 'interaction'
}>(), {
	initialReply: '',
	focusSeq: 0,
	warmupMode: 'visible',
})

const appConfig = useAppConfig()

const commentEl = useTemplateRef('comment')
const popoverEl = useTemplateRef<TippyComponent>('popover')
const popoverJumpTo = ref('')
const popoverInputEl = useTemplateRef('popover-input')
const showUndo = ref(false)
const twikooReady = ref(false)
const twikooLoading = ref(false)

const popoverBind = ref<TippyComponent['$props']>({})
const modalStore = useModalStore()
const twikooScriptSrc = appConfig.twikoo.scriptSrc
let twikooInitPromise: Promise<void> | undefined
let twikooObserver: IntersectionObserver | undefined

/** 评论区链接守卫与图片放大 */
useEventListener(commentEl, 'click', (e) => {
	if (!(e.target instanceof Element))
		return

	// 忽略头像点击
	if (e.target.matches('.tk-avatar-img')) {
		e.stopPropagation()
		return
	}

	// 评论图片放大
	if (e.target.tagName === 'IMG' && e.target.closest('.tk-content')) {
		const imgEl = e.target as HTMLImageElement
		modalStore.use(
			() => h(LazyPopoverLightbox, { el: imgEl, caption: imgEl.alt || '' }),
			{ unique: true },
		).open()
		return
	}

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

function getCommentInput() {
	const input = document.querySelector('#twikoo .tk-input textarea')
	return input instanceof HTMLTextAreaElement ? input : null
}

async function waitForCommentInput() {
	for (let index = 0; index < 50; index += 1) {
		const input = getCommentInput()
		if (input)
			return input

		await new Promise(resolve => window.setTimeout(resolve, 100))
	}

	return null
}

function fillCommentInput(input: HTMLTextAreaElement, content?: string) {
	if (content?.trim()) {
		const quotes = content.split('\n').map(str => `> ${str}`)
		input.value = `${quotes}\n\n`
	} else {
		input.value = ''
	}

	input.dispatchEvent(new InputEvent('input'))

	const length = input.value.length
	input.setSelectionRange(length, length)
}

function loadTwikooScript() {
	if (window.twikoo?.init)
		return Promise.resolve()

	const scriptEl = document.querySelector<HTMLScriptElement>(`script[src="${twikooScriptSrc}"]`)
	if (scriptEl) {
		return new Promise<void>((resolve, reject) => {
			scriptEl.addEventListener('load', () => resolve(), { once: true })
			scriptEl.addEventListener('error', () => reject(new Error('Twikoo 脚本加载失败')), { once: true })
		})
	}

	return new Promise<void>((resolve, reject) => {
		const script = document.createElement('script')
		script.src = twikooScriptSrc
		script.defer = true
		script.onload = () => resolve()
		script.onerror = () => reject(new Error('Twikoo 脚本加载失败'))
		document.head.appendChild(script)
	})
}


async function initTwikoo() {
	if (twikooReady.value)
		return

	if (!twikooInitPromise) {
		twikooLoading.value = true
		twikooInitPromise = (async () => {
			await loadTwikooScript()
			await window.twikoo?.init?.({
				envId: appConfig.twikoo?.envId,
				// twikoo 会把挂载后的元素变为 #twikoo
				el: '#twikoo',
			})
			twikooReady.value = true
		})()
			.catch((error) => {
				console.error(error)
				throw error
			})
			.finally(() => {
				twikooLoading.value = false
			})
	}

	try {
		await twikooInitPromise
	}
	catch (error) {
		return
	}
}

function warmupTwikoo() {
	void initTwikoo()
	twikooObserver?.disconnect()
	twikooObserver = undefined
}

async function focusReply(content?: string) {
	await initTwikoo()

	const input = await waitForCommentInput()
	if (!input)
		return

	fillCommentInput(input, content)
	input.focus({ preventScroll: true })
}

watch(() => props.focusSeq, (focusSeq) => {
	if (!focusSeq)
		return

	void focusReply(props.initialReply)
}, { immediate: true })

onMounted(() => {
	if (props.warmupMode !== 'visible')
		return

	if (!commentEl.value) {
		warmupTwikoo()
		return
	}

	if (typeof window.IntersectionObserver !== 'function') {
		warmupTwikoo()
		return
	}

	twikooObserver = new window.IntersectionObserver((entries) => {
		if (entries.some(entry => entry.isIntersecting))
			warmupTwikoo()
	}, { rootMargin: '320px 0px' })

	twikooObserver.observe(commentEl.value)
})

onBeforeUnmount(() => {
	twikooObserver?.disconnect()
})

useEventListener(commentEl, 'pointerdown', warmupTwikoo, { once: true })
useEventListener(commentEl, 'focusin', warmupTwikoo, { once: true })
</script>

<template>
<section ref="comment" class="z-comment">
	<h2 class="text-creative">
		评论区
	</h2>

	<!-- interactive 默认会把气泡移动到 triggerTarget 的父元素上 -->
	<Tooltip
		ref="popover"
		v-bind="popoverBind"
		interactive
		:append-to="() => commentEl!"
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
					<Icon name="ph:arrow-u-up-left-bold" />
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
		<div
			v-if="!twikooReady"
			class="comment-loading"
			:class="{ 'is-clickable': !twikooLoading && props.warmupMode === 'interaction' }"
		>
			<div v-if="twikooLoading" class="loading-spinner" />
			<p>{{ twikooLoading ? '评论加载中...' : props.warmupMode === 'interaction' ? '点击评论区加载评论' : '评论区会在接近此处或点击后加载' }}</p>
			<ZButton v-if="!twikooLoading && props.warmupMode === 'visible'" text="立即加载" @click="warmupTwikoo" />
		</div>
	</div>
</section>
</template>

<style lang="scss" scoped>
.z-comment {
	--comment-control-radius: 0.5rem;
	--comment-panel-bg: var(--ld-bg-card);
	--comment-panel-bg-soft: var(--c-bg-2);
	--comment-panel-border: var(--c-border);
	--comment-panel-hover: var(--c-bg-3);
	--comment-panel-active: var(--c-primary-soft);
	--comment-panel-text: var(--c-text-1);
	--comment-panel-text-muted: var(--c-text-2);
	--comment-panel-divider: color-mix(in srgb, var(--c-border) 78%, var(--c-text-3) 22%);

	@supports (color: color-mix(in srgb, transparent, transparent)) {
		--comment-panel-bg: color-mix(in srgb, var(--ld-bg-card) 80%, var(--c-bg-1));
		--comment-panel-bg-soft: color-mix(in srgb, var(--c-bg-2) 82%, var(--c-bg-3));
		--comment-panel-border: color-mix(in srgb, var(--c-border) 68%, var(--c-primary) 32%);
		--comment-panel-hover: color-mix(in srgb, var(--c-primary-soft) 38%, var(--c-bg-3) 62%);
		--comment-panel-active: color-mix(in srgb, var(--c-primary-soft) 58%, var(--c-bg-3) 42%);
		--comment-panel-text: color-mix(in srgb, var(--c-text-1) 92%, white 8%);
		--comment-panel-text-muted: color-mix(in srgb, var(--c-text-2) 88%, var(--c-text-1) 12%);
		--comment-panel-divider: color-mix(in srgb, var(--c-border) 60%, var(--c-text-1) 40%);
	}

	margin: 2rem auto;
	padding: 0 1rem;

	> h2 {
		margin-top: 3rem;
		font-size: 1.25rem;
	}
}

.comment-loading {
	padding: 2rem;
	text-align: center;
	color: var(--c-text-2);

	&.is-clickable {
		cursor: pointer;
	}

	.loading-spinner {
		width: 2.5rem;
		height: 2.5rem;
		margin: 0 auto 1rem;
		border: 3px solid var(--c-bg-3);
		border-top-color: var(--c-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	p { font-size: 0.9rem; }
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
	}

	// ====== 提交区布局：输入框 → 信息栏 → 按钮 ======
	.tk-submit {
		display: flex;
		flex-direction: column;

		.tk-avatar,
		a.tk-submit-action-icon.__markdown { display: none; }

		.tk-preview-container { margin: 0 0 0.5rem; }

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
		border: 1px solid var(--comment-panel-border);
		border-radius: var(--comment-control-radius);
		background: var(--comment-panel-bg-soft);
		color: var(--comment-panel-text-muted);
		transition: background-color 0.2s, color 0.2s, border-color 0.2s;

		&:hover {
			border-color: var(--c-primary);
			background: var(--comment-panel-hover);
			color: var(--c-text-1);
		}
	}

	.OwO .OwO-body {
		overflow: hidden;
		border: 1px solid var(--comment-panel-border);
		border-radius: var(--comment-control-radius);
		background: linear-gradient(180deg, var(--comment-panel-bg-soft), var(--comment-panel-bg));
		box-shadow: var(--box-shadow-1), var(--box-shadow-3);
		color: var(--comment-panel-text);

		.OwO-items {
			padding: 0.4rem;
			background: transparent;
			color: inherit;
		}

		.OwO-item {
			color: var(--comment-panel-text);
			opacity: 0.96;
			border-radius: calc(var(--comment-control-radius) - 0.125rem);
			text-shadow: 0 0 0.01px currentColor;
			transition: background-color 0.2s, color 0.2s, transform 0.2s;

			&:hover {
				background: var(--comment-panel-hover);
				color: var(--comment-panel-text);
				transform: translateY(-1px);
			}
		}

		.OwO-bar {
			border-top: 1px solid var(--comment-panel-divider);
			background: var(--comment-panel-bg-soft);
		}

		.OwO-packages {
			padding: 0.25rem;
		}

		.OwO-packages li {
			border-radius: calc(var(--comment-control-radius) - 0.125rem);
			color: var(--comment-panel-text-muted);
			font-weight: 500;
			transition: background-color 0.2s, color 0.2s;

			&:hover {
				background: var(--comment-panel-hover);
				color: var(--comment-panel-text);
			}
		}

		.OwO-packages .OwO-package-active,
		.OwO-packages li[aria-selected='true'] {
			background: var(--comment-panel-active);
			color: var(--comment-panel-text);
			box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c-primary) 35%, transparent);
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
		margin-top: 0;
		font-size: 0.95rem;
		line-height: 1.6;

		.tk-owo-emotion {
			width: auto;
			height: 1.4em;
			vertical-align: text-bottom;
		}
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
		border-radius: var(--comment-control-radius);
		font-size: 0.8125rem;
	}

	p { margin: 0.2em 0; }
	img {
		border-radius: var(--comment-control-radius);
		cursor: zoom-in;
	}

	code {
		padding: 0.15em 0.35em;
		border: 1px solid var(--c-border);
		border-radius: 4px;
		background: var(--c-bg-2);
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

@keyframes spin {
	to { transform: rotate(1turn); }
}
</style>
