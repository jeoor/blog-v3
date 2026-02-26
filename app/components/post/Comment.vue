<script setup lang="tsx">
import type { TippyComponent } from 'vue-tippy'
import { LazyPopoverLightbox } from '#components'

const appConfig = useAppConfig()

const commentEl = useTemplateRef('comment')
const popoverEl = useTemplateRef<TippyComponent>('popover')
const popoverJumpTo = ref('')
const popoverInputEl = useTemplateRef('popover-input')
const showUndo = ref(false)

const popoverBind = ref<TippyComponent['$props']>({})
const modalStore = useModalStore()

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

onMounted(() => {
	window.twikoo?.init?.({
		envId: appConfig.twikoo?.envId,
		// twikoo 会把挂载后的元素变为 #twikoo
		el: '#twikoo',
	})
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
		<div class="comment-loading">
			<div class="loading-spinner" />
			<p>评论加载中...</p>
		</div>
	</div>
</section>
</template>

<style lang="scss" scoped>
.z-comment {
	margin: 2rem auto;
	padding: 0 1rem;

	> h3 {
		margin-top: 3rem;
		font-size: 1.25rem;
	}
}

.comment-loading {
	padding: 2rem;
	text-align: center;
	color: var(--c-text-2);

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
				border-radius: 0.5em;
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
				border-radius: 0.5em;
				background: var(--c-bg-2);
				transition: border-color 0.2s;

				&:focus-within { border-color: var(--c-primary); }
			}

			.el-input__inner { border: none; }

			.el-input-group__prepend {
				border: none;
				border-radius: 0.5em 0 0 0.5em;
				background: var(--c-bg-1);
				color: var(--c-text-2);
			}
		}
	}

	// 按钮
	.tk-preview, .tk-cancel {
		border: 1px solid var(--c-bg-soft);
		border-radius: 0.5em;
		background-color: var(--ld-bg-card);
		color: var(--c-text-1);
		transition: background-color 0.2s;

		&:hover { background-color: var(--c-bg-2); }
	}

	.tk-send {
		border: 1px solid var(--c-primary);
		border-radius: 0.5em;
		background-color: var(--c-primary);
		color: var(--c-bg);
		transition: background-color 0.2s;

		&:hover { opacity: 0.85; }
	}

	// 表情面板
	.OwO .OwO-body {
		border-radius: 0.5em;
		background: var(--c-bg-1);
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
		border-radius: 0.5em;
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
		border-radius: 0.5rem;
		font-size: 0.8125rem;
	}

	p { margin: 0.2em 0; }
	img {
		border-radius: 0.5em;
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
