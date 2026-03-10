<script setup lang="ts">
const layoutStore = useLayoutStore()
const { asideWidgets } = storeToRefs(layoutStore)

const { widgets } = useWidgets(asideWidgets)
</script>

<template>
<BlogMask
	:show="layoutStore.state === 'aside'"
	class="widescreen-only"
	@click="layoutStore.close()"
/>

<!-- 不能用 Transition 实现弹出收起动画，因为宽屏状态始终显示 -->
<aside
	id="blog-aside"
	:class="{ show: layoutStore.state === 'aside', hidden: !asideWidgets?.length }"
	:aria-hidden="!asideWidgets?.length || undefined"
>
	<TransitionGroup name="float-in">
		<!-- 更换页面时相同 key 的组件不会更新 -->
		<component :is="widget.comp" v-for="widget in widgets" :key="widget.name" />
		<div v-if="!widgets.length" key="aside-placeholder" />
	</TransitionGroup>
</aside>
</template>

<style lang="scss" scoped>
#blog-aside {
	overflow: auto;
	padding: 0.5rem;
	z-index: var(--z-index-popover);

	&.hidden {
		display: none;
	}

	@media (max-width: $breakpoint-widescreen) {
		position: fixed;
		inset-inline-end: 0;
		top: 0;
		width: 320px;
		height: auto;
		max-width: 100%;
		max-height: 100%;
		transform: var(--transform-end-far);
		transition: transform 0.2s;

		:deep(.blog-widget) {
			padding: 0.5rem;
			border-radius: 1rem;
			box-shadow: var(--box-shadow-1), var(--box-shadow-2);
			background-color: var(--ld-bg-blur);
			backdrop-filter: blur(0.5rem);
		}

		&.show {
			transform: none;
		}
	}
}

.float-in-leave-active {
	position: absolute;
}
</style>
