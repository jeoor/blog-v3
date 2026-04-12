<script setup lang="ts">
const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'tag-cloud', 'countdown'])

const { author, subtitle } = useAppConfig()

const title = '关于'
const description = '关于我，关于这个博客。'
useSeoMeta({ title, description })

const { data: postAbout } = await useAsyncData(
	'/about',
	() => queryCollection('content').path('/about').first(),
)
</script>

<template>
<div class="page-about">
	<section class="about-author">
		<NuxtImg class="avatar" :src="author.avatar" :alt="author.name" />
		<h2 class="text-creative">
			{{ author.name }}
		</h2>
		<p class="subtitle">{{ subtitle }}</p>
	</section>

	<ContentRenderer
		v-if="postAbout"
		:value="postAbout"
		class="about-content"
	/>
	<p v-else class="text-center">
		可于 content/about.md 编写关于内容。
	</p>

	<section class="about-section">
		<h2 class="text-creative">联系方式</h2>
		<div class="contact-list">
			<a href="https://www.kayro.cn/" target="_blank" rel="noopener noreferrer">
				<Icon name="tabler:home" />
				<span>主页</span>
			</a><a href="https://space.bilibili.com/513671572" target="_blank" rel="noopener noreferrer">
				<Icon name="tabler:brand-bilibili" />
				<span>哔哩哔哩</span>
			</a>
			<a href="https://github.com/jeoor" target="_blank" rel="noopener noreferrer">
				<Icon name="tabler:brand-github" />
				<span>GitHub</span>
			</a><a href="mailto:i@kayro.cn" target="_blank" rel="noopener noreferrer">
				<Icon name="tabler:mail" />
				<span>邮箱</span>
			</a>
		</div>
	</section>
</div>
</template>

<style lang="scss" scoped>
.page-about {
	animation: float-in .2s backwards;
	margin: 1rem;
}

.about-author {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	margin: 2rem 0 2.5rem;

	.avatar {
		width: 7.5rem;
		border-radius: 50%;
		box-shadow: var(--box-shadow-1);

		@supports (corner-shape: squircle) {
			corner-shape: superellipse(1.2);
		}
	}

	h2 {
		margin: 0;
		font-size: 1.8rem;
	}

		.subtitle {
			margin: 0;
			color: var(--c-text-2);
			font-size: 1rem;
		}
}

.about-content {
	margin-bottom: 2.5rem;

	:deep(h2) {
		margin: 2.5rem 0 .75rem;
		font-size: 1.15rem;
		color: var(--c-text);
		font-weight: 550;

		&:first-child {
			margin-top: 0;
		}
	}

	:deep(p) {
		margin: .5rem 0;
		line-height: 1.8;
		color: var(--c-text-2);
	}

	:deep(ul) {
		margin: .5rem 0;
		padding-inline-start: 1.5em;
		list-style: revert;

		li {
			margin: .4rem 0;
			line-height: 1.8;
			color: var(--c-text-2);

			&::marker { color: var(--c-primary); }

			a {
				color: var(--c-primary);
				transition: color .2s;

				&:hover { color: var(--c-text); }
			}
		}
	}
}

.about-section {
	margin-top: 2.5rem;

	h2 {
		margin-bottom: .75rem;
		font-size: 1.15rem;
		font-weight: 550;
	}
}

.contact-list {
	display: flex;
	flex-wrap: wrap;
	gap: .5rem;

	a {
		display: flex;
		align-items: center;
		gap: .3rem;
		padding: .3rem .7rem;
		border-radius: .5rem;
		background-color: var(--c-bg-2);
		color: var(--c-text-2);
		font-size: .85rem;
		transition: background-color .2s, color .2s;

		&:hover {
			background-color: var(--c-bg-3);
			color: var(--c-text);
		}
	}
}
</style>
