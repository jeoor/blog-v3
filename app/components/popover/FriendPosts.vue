<script setup lang="ts">
import type { ModalEmits, ModalProps } from '#modals'
import { getFixedDelay } from '~/utils/anim'

defineProps<ModalProps & {
	author: string
	avatar: string
	link: string
	articles: Array<{
		id: string
		title: string
		link: string
		created: string
	}>
}>()

defineEmits<ModalEmits>()
</script>

<template>
<Transition name="modal">
	<div
		v-if="open"
		id="avatar-popup"
		class="modal"
		@click="$emit('close')"
	>
		<div class="modal__content" @click.stop>
			<div class="modal__header">
				<NuxtImg :src="avatar" :alt="author" loading="lazy" class="modal__avatar-img" />
				<h3>{{ author }}</h3>
				<a :href="link" target="_blank" rel="noopener noreferrer" class="modal__author-link">
					<Icon name="lucide:external-link" />
				</a>
			</div>
			<div class="modal__body">
				<div class="timeline">
					<div
						v-for="(article, index) in articles"
						:key="article.id"
						class="timeline__item"
						data-transition-enter
						:style="getFixedDelay(0.2 + index * 0.1)"
					>
						<span class="timeline__date">{{ article.created }}</span>
						<a
							:href="article.link" target="_blank" rel="noopener noreferrer" class="timeline__title"
							@click="$emit('close')"
						>
							{{ article.title }}
						</a>
					</div>
				</div>
			</div>
			<div class="modal__avatar">
				<NuxtImg :src="avatar" :alt="author" loading="lazy" />
			</div>
		</div>
	</div>
</Transition>
</template>

<style scoped>
.modal {
	display: flex;
	align-items: center;
	justify-content: center;
	position: fixed;
	inset: 0;

	.modal__content {
		position: relative;
		overflow-y: auto;
		width: 90%;
		max-width: 500px;
		max-height: 80vh;
		max-height: 80dvh;
		padding: 1.25rem;
		border-radius: 0.5rem;
		box-shadow: var(--box-shadow-3);
		background-color: var(--ld-bg-card);

		.modal__header {
			display: flex;
			align-items: center;
			gap: 15px;
			margin-bottom: 20px;
			padding-bottom: 15px;
			border-bottom: 1px solid var(--c-bg-soft);

			img {
				width: 50px;
				height: 50px;
				border-radius: 50%;
				object-fit: cover;
			}

			h3 {
				flex: 1;
				margin: 0;
				font-size: 1.2rem;
			}

			.modal__author-link {
				padding: 8px;
				border-radius: 8px;
				color: var(--c-text-2);
				transition: all var(--motion-duration);

				&:hover {
					background: var(--c-bg-soft);
					color: var(--c-text);
				}
			}
		}

		.modal__body {
			.timeline {
				position: relative;

				&::after {
					content: "";
					position: absolute;
					top: 0.5rem;
					bottom: 0;
					left: 0.25rem;
					width: 2px;
					background-color: var(--c-bg-soft);
					transform: translate(-50%);
				}

				.timeline__item {
					position: relative;
					padding: 0 0 1rem 1.25rem;
					color: var(--c-text-2);
					animation: float-in var(--motion-duration) var(--motion-easing) var(--delay) backwards;

					&::before {
						content: "";
						position: absolute;
						top: 0.5rem;
						left: 0.25rem;
						width: 0.5rem;
						height: 0.5rem;
						border-radius: 50%;
						background-color: var(--c-text-2);
						transform: translateY(-50%) translate(-50%);
						transition: transform var(--motion-duration) ease, box-shadow var(--motion-duration) ease;
						z-index: 1;
					}

					&:hover::before {
						box-shadow: 0 0 8px var(--c-text-2);
						transform: translateY(-50%) translate(-50%) scale(1.5);
					}

					.timeline__date {
						display: block;
						margin-bottom: 0.3rem;
						font-family: var(--font-monospace);
						font-size: 0.875rem;
						color: var(--c-text-3);
					}

					.timeline__title {
						line-height: 1.4;
						color: var(--c-text-2);
						transition: color var(--motion-duration);

						&:hover {
							color: var(--c-text);
						}
					}
				}
			}
		}

		.modal__avatar {
			position: absolute;
			overflow: hidden;
			opacity: 0.6;
			right: 1.25rem;
			bottom: 1.25rem;
			width: 128px;
			height: 128px;
			border-radius: 50%;
			filter: blur(5px);
			pointer-events: none;
			z-index: 1;

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}
	}
}

.modal-enter-active,
.modal-leave-active {
	transition: opacity var(--motion-duration) var(--motion-easing);
}

.modal-enter-active .modal__content,
.modal-leave-active .modal__content {
	transition: transform var(--motion-duration) var(--motion-easing);
}

.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}

.modal-enter-from .modal__content,
.modal-leave-to .modal__content {
	transform: translateY(-20px);
}

.modal-enter-to,
.modal-leave-from {
	opacity: 1;
}

.modal-enter-to .modal__content,
.modal-leave-from .modal__content {
	transform: translateY(0);
}
</style>
