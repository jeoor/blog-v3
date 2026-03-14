import { LazyContentRenderer } from '#components'
import { defineAsyncComponent } from 'vue'
import BlogWidget from '~/components/blog/BlogWidget.vue'

// @keep-sorted
const rawWidgets = {
	'blog-stats': defineAsyncComponent(() => import('~/components/widget/BlogStats.vue')),
	'blog-tech': defineAsyncComponent(() => import('~/components/widget/BlogTech.vue')),
	'countdown': defineAsyncComponent(() => import('~/components/widget/Countdown.vue')),
	'empty': defineAsyncComponent(() => import('~/components/widget/Empty.vue')),
	'tag-cloud': defineAsyncComponent(() => import('~/components/widget/TagCloud.vue')),
	'toc': defineAsyncComponent(() => import('~/components/widget/Toc.vue')),
} as const

export type WidgetName = keyof typeof rawWidgets | `meta-aside-${string}`

export default function useWidgets(widgetList: MaybeRefOrGetter<WidgetName[]>) {
	const store = useContentStore()

	function renderMetaSlots(widgetName: WidgetName) {
		const slotsTree = store.meta.slots[widgetName.slice('meta-'.length)]
		return h(
			BlogWidget,
			{ card: !slotsTree, ...slotsTree?.props },
			() => slotsTree
				? h(LazyContentRenderer, { value: slotsTree })
				: `${widgetName} 不存在`,
		)
	}

	const widgets = computed(() => toValue(widgetList).map(widgetName => ({
		name: widgetName,
		comp: widgetName.startsWith('meta-aside-')
			? renderMetaSlots(widgetName)
			: rawWidgets[widgetName as keyof typeof rawWidgets],
	})))

	return {
		widgets,
	}
}
