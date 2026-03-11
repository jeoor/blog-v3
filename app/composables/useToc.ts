import type { Toc, TocLink } from '@nuxt/content'

interface TocList {
	id: string
	offsetTop: number
}

export function useToc(toc: MaybeRefOrGetter<Toc | undefined>) {
	const { height: bodyHeight } = useElementSize(document?.body)
	const scrollMarginTop = ref(64)
	let scrollFrame = 0

	function flattenToc(tocTree: TocLink[], tocList: TocList[] = []) {
		tocTree.forEach((item) => {
			const headingEl = document.getElementById(item.id)
			if (headingEl)
				tocList.push({ id: item.id, offsetTop: headingEl.offsetTop })
			if (item.children)
				flattenToc(item.children, tocList)
		})
		return tocList
	}

	const tocOffsets = computedWithControl(
		refDebounced(bodyHeight),
		() => flattenToc(toValue(toc)?.links || []).reverse(),
	)

	const { y: windowScrollY } = useWindowScroll()

	function updateScrollMarginTop() {
		if (!document)
			return

		const margin = Number.parseFloat(getComputedStyle(document.documentElement).scrollMarginTop)
		scrollMarginTop.value = Number.isFinite(margin) ? margin : 64
	}

	function getActiveHeading() {
		const scrollPosition = windowScrollY.value + scrollMarginTop.value
		// 为兼容性不使用 findLast，而是使用倒序的 tocOffsets
		return tocOffsets.value.find(item => item.offsetTop <= scrollPosition)?.id
	}

	const activeHeadingId = computedWithControl(
		refThrottled(windowScrollY, undefined, true),
		() => document && getActiveHeading(),
	)

	function scrollToActiveTocItem() {
		if (!document || !activeHeadingId.value)
			return

		cancelAnimationFrame(scrollFrame)
		scrollFrame = requestAnimationFrame(() => {
			const tocContainerEl = document.getElementById('blog-aside')
			const activeTocEl = document.querySelector(`#blog-aside a[href="#${activeHeadingId.value}"]`) as HTMLElement | null
			// scrollIntoView 触发目录滚动时导致文章持续缓慢滚动并打断正常滚动
			tocContainerEl?.scroll({ top: activeTocEl?.offsetTop ?? 0 })
		})
	}

	onMounted(updateScrollMarginTop)
	onBeforeUnmount(() => cancelAnimationFrame(scrollFrame))
	useEventListener(window, 'resize', updateScrollMarginTop)
	watch(activeHeadingId, scrollToActiveTocItem)

	return {
		tocOffsets,
		activeHeadingId,
	}
}
