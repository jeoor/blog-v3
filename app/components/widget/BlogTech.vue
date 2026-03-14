<script setup lang="ts">
import { Icon } from '#components'
import { myFeed } from '~~/blog.config'
import { packageManager, version } from '~~/package.json'

const wrappingQuotesRE = /^['"]|['"]$/g
const httpUrlRE = /^https?:\/\//

const appConfig = useAppConfig()
const runtimeConfig = useRuntimeConfig()
const { arch, ci, nodeVersion, platform } = runtimeConfig.public
const techstackVersions = computed(() => ((runtimeConfig.public as Record<string, unknown>).techstackVersions as Record<string, string> | undefined) ?? {})

const fallbackCi = myFeed.archs?.find(name => name in ciIcons) ?? ''
const normalizedCi = computed(() => ci?.trim().replace(wrappingQuotesRE, '') || fallbackCi)

function isImageSource(value: string) {
	return value.startsWith('/') || httpUrlRE.test(value)
}

const ciPlatform = computed(() => {
	if (!normalizedCi.value)
		return ''

	const ciName = Object.keys(ciIcons).find(name => name.toLowerCase() === normalizedCi.value.toLowerCase()) ?? normalizedCi.value
	const iconName = ciIcons[ciName]
	if (!iconName)
		return ciName

	const iconNode = isImageSource(iconName)
		? h('img', { src: iconName, alt: '', width: 64, height: 64, loading: 'lazy', decoding: 'async' })
		: h(Icon, { name: iconName })

	return h('span', {}, [iconNode, ` ${ciName.split(' ')[0]}`])
})
const [pm, pmVersion] = packageManager.split('@') as [string, string]

const service = computed(() => ([
	...normalizedCi.value ? [{ label: '构建平台', value: ciPlatform }] : [],
	{ label: '图片存储', value: () => h('span', {}, [h('img', { src: '/icon/7bu.webp', alt: '', width: 64, height: 64, loading: 'lazy', decoding: 'async' }), '去不图床']) },
	{ label: '软件协议', value: 'MIT' },
	{ label: '文章许可', value: appConfig.copyright.abbr },
	{ label: '规范域名', value: getDomain(appConfig.url) },
]))

const techstack = computed(() => ([
	{ label: 'Blog', value: version },
	{ label: 'Vue', value: techstackVersions.value.vue },
	{ label: 'Nuxt', value: techstackVersions.value.nuxt },
	{ label: 'Content', value: techstackVersions.value.content },
	{ label: 'Node', value: nodeVersion },
	{ label: pm, value: pmVersion },
	{ label: 'OS', value: platform },
	{ label: 'Arch', value: arch },
]))

const expand = ref(false)
</script>

<template>
<BlogWidget card title="技术信息">
	<ZDlGroup :items="service" />
	<ZExpand v-model="expand" in-place name="构建信息">
		<ZDlGroup size="small" :items="techstack" />
	</ZExpand>
</BlogWidget>
</template>

<style lang="scss" scoped>
.z-expand {
	margin-top: 0.2em;
}

.dl-group :deep(img) {
	width: auto;
	height: 1.2em;
	vertical-align: sub;
}
</style>
