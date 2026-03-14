<script setup lang="ts">
import { toZonedTemporal } from '~~/shared/utils/time'

const yearRE = /\b\d{4}\b/u

const appConfig = useAppConfig()
const runtimeConfig = useRuntimeConfig()

const footerCopyright = computed(() => {
	const buildYear = String(toZonedTemporal(runtimeConfig.public.buildTime).year)

	return appConfig.footer.copyright.replace(yearRE, buildYear)
})
</script>

<template>
<footer class="blog-footer">
	<nav class="footer-nav">
		<div v-for="(group, groupIndex) in appConfig.footer.nav" :key="groupIndex" class="footer-nav-group">
			<p v-if="group.title" class="footer-nav-title">
				{{ group.title }}
			</p>
			<menu>
				<li v-for="(item, itemIndex) in group.items" :key="itemIndex">
					<UtilLink :to="item.url">
						<Icon :name="item.icon" />
						<span class="nav-text">{{ item.text }}</span>
					</UtilLink>
				</li>
			</menu>
		</div>
	</nav>
	<p v-html="footerCopyright" />
</footer>
</template>

<style lang="scss" scoped>
.blog-footer {
	margin: 3rem 1rem;
	font-size: 0.9em;
	color: var(--c-text-2);

	.footer-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 5vw clamp(2rem, 5%, 5vw);
		padding-block: 3rem;

		.footer-nav-title {
			margin: 0.5em;
			font: inherit;
		}

		a {
			display: flex;
			align-items: center;
			gap: 0.3em;
			width: fit-content;
			padding: 0.3em 0.5em;
			border-radius: 0.5em;
			font-size: 0.9em;
			transition: background-color 0.2s, color 0.1s;

			&:hover {
				background-color: var(--c-bg-soft);
				color: var(--c-text);
			}
		}
	}

	p {
		margin: 0.5em;
	}
}
</style>
