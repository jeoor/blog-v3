<script setup lang="ts">
import { UtilDate } from '#components'

interface StatsEntry {
	posts: number
	words: number
}

interface StatsPayload {
	total?: {
		posts?: number
		words?: number
	}
	annual?: Record<string, StatsEntry>
}

const appConfig = useAppConfig()
const runtimeConfig = useRuntimeConfig()
const mounted = useMounted()

// 响应头不正确时，stats.value 可能会是字符串，首次属性访问可能为 undefined
const { data: stats } = useFetch<StatsPayload | string>('/api/stats')

const normalizedStats = computed<StatsPayload | undefined>(() => {
	if (!stats.value)
		return undefined

	if (typeof stats.value !== 'string')
		return stats.value

	try {
		return JSON.parse(stats.value) as StatsPayload
	}
	catch {
		return undefined
	}
})

onMounted(() => {
	nextTick(() => {
		window.__refreshBusuanzi?.()
	})
})

const yearlyTip = computed(() => Object
	.entries(normalizedStats.value?.annual || {})
	.reverse()
	.map(([year, item]) => `${year}年：${item.posts}篇，${formatNumber(item.words)}字`)
	.join('\n') || '数据获取失败',
)

const blogStats = [{
	label: '运营时长',
	value: computed(() => mounted.value ? timeElapse(appConfig.timeEstablished) : '--'),
	tip: `博客于${appConfig.timeEstablished}上线`,
}, {
	label: '上次更新',
	value: () => h(UtilDate, {
		date: runtimeConfig.public.buildTime,
		relative: true,
		tipPrefix: '构建于',
	}),
}, {
	label: '总字数',
	value: computed(() => formatNumber(normalizedStats.value?.total?.words) || '--'),
	tip: yearlyTip,
}, {
	label: '本站访客量',
	value: () => h('span', { id: 'busuanzi_site_uv', class: 'busuanzi-value' }),
}, {
	label: '本站访问量',
	value: () => h('span', { id: 'busuanzi_site_pv', class: 'busuanzi-value' }),
}]
</script>

<template>
<BlogWidget card title="博客统计">
	<ZDlGroup :items="blogStats" size="small" />
</BlogWidget>
</template>

<style lang="scss" scoped>
:deep(.busuanzi-value:empty::before) {
	content: "--";
}
</style>
