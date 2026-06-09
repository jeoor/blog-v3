<script setup lang="ts">
const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'tag-cloud', 'countdown'])

const { author, footer, subtitle } = useAppConfig()

const title = '关于'
const description = '关于我，关于这个博客。'
const contactHeading = '联系我'
const excludedContactTexts: string[] = [
	'开往-友链接力',
]
useSeoMeta({ title, description })

const { data: postAbout } = await useAsyncData(
	'/about',
	() => queryCollection('content').path('/about').first(),
)

const contactLinks = computed(() => footer.iconNav.filter(({ text, url }) => {
	if (!(url.startsWith('http') || url.startsWith('mailto:')))
		return false

	return !excludedContactTexts.includes(text)
}))
</script>

<template>
<div class="page-about">
	<section class="about-author">
		<NuxtImg class="avatar" :src="author.avatar" :alt="author.name" />
		<h2 class="text-creative">
			{{ author.name }}
		</h2>
		<p class="subtitle">
			{{ subtitle }}
		</p>
	</section>

	<AboutDonut />

	<ContentRenderer
		v-if="postAbout"
		:value="postAbout"
		class="article about-content"
	/>
	<p v-else class="about-empty text-center">
		可于 content/about.md 编写关于内容。
	</p>

	<section class="about-section">
		<h2 :id="contactHeading">
			<a :href="`#${contactHeading}`">{{ contactHeading }}</a>
		</h2>
		<div class="contact-list">
			<a
				v-for="item in contactLinks"
				:key="item.url"
				:href="item.url"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Icon :name="item.icon" />
				<span>{{ item.text }}</span>
			</a>
		</div>
	</section>
</div>
</template>

<style lang="scss" scoped>
.page-about {
	margin: 1rem;
	animation: float-in 0.2s backwards;
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
		font-size: 1rem;
		color: var(--c-text-2);
	}
}

.about-content {
	margin: 0 0 2.5rem;

	:deep(h2) {
		margin: 2.5rem 0 0.75rem;
		font-size: 1.15rem;
		font-weight: 550;
		color: var(--c-text);

		&:first-child {
			margin-top: 0;
		}
	}

	:deep(p) {
		margin: 0.5rem 0;
		line-height: 1.8;
		color: var(--c-text-2);
	}

	:deep(ul) {
		margin: 0.5rem 0;
		padding-inline-start: 1.5em;
		list-style: revert;

		li {
			margin: 0.4rem 0;
			line-height: 1.8;
			color: var(--c-text-2);

			&::marker { color: var(--c-primary); }

			a {
				color: var(--c-primary);
				transition: color 0.2s;

				&:hover { color: var(--c-text); }
			}
		}
	}
}

.about-empty {
	margin: 2rem 0 2.5rem;
	line-height: 1.8;
	color: var(--c-text-2);
}

.about-section {
	margin-top: 2.5rem;

	h2 {
		margin: 2.5rem 0 0.75rem;
		font-size: 1.15rem;
		font-weight: 550;
		color: var(--c-text);

		a {
			text-decoration: none;
			color: inherit;
		}
	}
}

.contact-list {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;

	a {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.3rem 0.7rem;
		border-radius: 0.5rem;
		background-color: var(--c-bg-2);
		font-size: 0.85rem;
		color: var(--c-text-2);
		transition: background-color 0.2s, color 0.2s;

		&:hover {
			background-color: var(--c-bg-3);
			color: var(--c-text);
		}
	}
}
</style>
