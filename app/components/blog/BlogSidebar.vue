<script setup lang="ts">
const appConfig = useAppConfig()
const layoutStore = useLayoutStore()

const searchLabel = ref('')
const searchButtonLabel = computed(() => searchLabel.value || '搜索')

let searchStorePromise: Promise<{ word: string }> | undefined
let searchLabelWatcherBound = false

function getSelectedText() {
	if (!import.meta.client)
		return ''

	return globalThis.getSelection?.()?.toString().trim() || ''
}

async function ensureSearchStore() {
	if (!searchStorePromise) {
		searchStorePromise = import('~/stores/search').then((searchStoreModule) => {
			const searchStore = searchStoreModule.useSearchStore()

			if (!searchLabelWatcherBound) {
				watch(() => searchStore.word, (word) => {
					searchLabel.value = word
				}, { immediate: true })
				searchLabelWatcherBound = true
			}

			return searchStore
		})
	}

	return searchStorePromise
}

async function toggleSearch() {
	if (layoutStore.state === 'search') {
		layoutStore.close()
		return
	}

	const searchStore = await ensureSearchStore()
	const selectionText = getSelectedText()

	if (selectionText)
		searchStore.word = selectionText

	layoutStore.toggle('search')
}

function onSearchShortcut(event: KeyboardEvent) {
	if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k')
		return

	event.preventDefault()
	void toggleSearch()
}

if (import.meta.client) {
	onMounted(() => {
		window.addEventListener('keydown', onSearchShortcut)
	})

	onBeforeUnmount(() => {
		window.removeEventListener('keydown', onSearchShortcut)
	})
}
</script>

<template>
<BlogMask
	:show="layoutStore.state === 'sidebar'"
	class="mobile-only"
	@click="layoutStore.close()"
/>

<!-- 不能用 Transition 实现弹出收起动画，因为半宽屏状态始终显示 -->
<aside id="blog-sidebar" :class="{ show: layoutStore.state === 'sidebar' }">
	<BlogHeader class="sidebar-header" to="/" />

	<nav class="sidebar-nav scrollcheck-y">
		<div
			class="search-btn sidebar-nav-item gradient-card"
			role="button"
			tabindex="0"
			@click="toggleSearch()"
			@keydown.enter.prevent="toggleSearch()"
			@keydown.space.prevent="toggleSearch()"
		>
			<Icon name="ph:magnifying-glass-bold" />
			<span class="nav-text">{{ searchButtonLabel }}</span>
			<span class="keycut" aria-hidden="true">Ctrl / ⌘ K</span>
		</div>

		<template v-for="(group, groupIndex) in appConfig.nav" :key="groupIndex">
			<h3 v-if="group.title">
				{{ group.title }}
			</h3>

			<menu>
				<li v-for="(item, itemIndex) in group.items" :key="itemIndex">
					<UtilLink :to="item.url" class="sidebar-nav-item">
						<Icon :name="item.icon" />
						<span class="nav-text">{{ item.text }}</span>
						<Icon v-if="isExtLink(item.url)" class="external-tip" name="ph:arrow-up-right" />
					</UtilLink>
				</li>
			</menu>
		</template>
	</nav>

	<footer class="sidebar-footer">
		<BlogThemeToggle />
		<ZIconNavList :list="appConfig.footer.iconNav" />
	</footer>
</aside>
</template>

<style lang="scss" scoped>
#blog-sidebar {
	display: flex;
	flex-direction: column;
	color: var(--c-text-2);

	&:hover {
		color: currentcolor;
	}

	@media (max-width: $breakpoint-mobile) {
		position: fixed;
		inset-inline-start: 0;
		width: 320px;
		max-width: 100%;
		background-color: var(--ld-bg-blur);
		backdrop-filter: blur(0.5rem);
		color: currentcolor;
		transform: var(--transform-start-far);
		transition: transform 0.2s;
		z-index: var(--z-index-popover);

		&.show {
			box-shadow: var(--box-shadow-1), var(--box-shadow-3);
			transform: none;
		}
	}
}

.sidebar-nav {
	flex-grow: 1;
	padding: 0 5%;
	font-size: 0.9em;

	h3 {
		margin: 2em 0 1em 1em;
		font: inherit;
		color: var(--c-text-2);
	}

	li {
		margin: 0.5em 0;
	}
}

.sidebar-nav-item {
	display: flex;
	align-items: center;
	gap: 0.5em;
	padding: 0.5em 1em;
	border-radius: 0.5em;
	transition: all 0.2s;

	&:hover,
	&.router-link-active {
		background-color: var(--c-bg-soft);
		color: var(--c-text);
	}

	&.router-link-active::after {
		content: "⦁";
		width: 1em;
		text-align: center;
		color: var(--c-text-3);
	}

	> .iconify {
		font-size: 1.5em;
	}

	> .nav-text {
		flex-grow: 1;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	> .external-tip {
		opacity: 0.5;
		font-size: 1em;
	}

	> .keycut {
		padding: 0.1em 0.5em;
		border-radius: 999px;
		background-color: var(--c-bg-soft);
		font-size: 0.75em;
		line-height: 1.6;
		white-space: nowrap;
		color: var(--c-text-3);
	}
}

.search-btn {
	opacity: 0.5;
	margin: 1rem 0;
	outline: 2px solid var(--c-border);
	outline-offset: -2px;
	cursor: text;
	user-select: none;

	&:hover {
		opacity: 1;
		outline-color: transparent;
		background-color: transparent;
	}
}

.sidebar-footer {
	--gap: clamp(0.5rem, 3vh, 1rem);

	display: grid;
	gap: var(--gap);
	padding: var(--gap);
	font-size: 0.8em;
	text-align: center;
	color: var(--c-text-2);
}
</style>
