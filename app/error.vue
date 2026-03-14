<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
	error: NuxtError & { url?: string }
}>()

const layoutStore = useLayoutStore()
layoutStore.setAside([])

const errorTitle = computed(() => {
	const statusCode = props.error?.statusCode
	const message = props.error?.message?.trim()

	if (statusCode === 404)
		return '页面不存在'

	if (statusCode && message)
		return `[${statusCode}] ${message}`

	if (statusCode)
		return `错误 ${statusCode}`

	return message || '页面错误'
})

useSeoMeta({
	title: errorTitle,
})

const errorStack = removeHtmlTags(props.error?.stack)

onMounted(() => {
	console.error(errorStack)
})
</script>

<template>
<NuxtLoadingIndicator />
<NuxtRouteAnnouncer :style="{ position: 'absolute' }" />
<BlogSkipToContent />
<BlogSidebar />
<div id="content">
	<main id="main-content">
		<div class="app-error">
			<ZError
				:code="errorStack"
				:message="error?.url"
				:title="errorTitle"
			>
				<template #operation>
					<ZButton text="返回主页" @click="clearError({ redirect: '/' })" />
					<ZButton text="尝试忽略" @click="clearError()" />
				</template>
			</ZError>
		</div>
		<BlogFooter />
	</main>
	<BlogAside />
</div>
<BlogPanel />
<BikariyaModals />
</template>

<style lang="scss" scoped>
.app-error {
	margin: 1rem;

	pre {
		text-align: start;
	}

	.error-stack {
		font-size: 0.9em;
		white-space: pre-wrap;
	}
}
</style>
