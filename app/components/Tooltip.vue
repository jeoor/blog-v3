<script setup lang="ts">
import type { TippyComponent } from 'vue-tippy'
import { roundArrow, Tippy as VueTippy } from 'vue-tippy'
import 'tippy.js/dist/svg-arrow.css'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const tooltipEl = useTemplateRef<TippyComponent>('tooltip')

const bind = computed(() => ({
	arrow: roundArrow,
	...attrs,
}))

defineExpose({
	hide: () => tooltipEl.value?.hide(),
	show: () => tooltipEl.value?.show(),
	setProps: (value: Record<string, unknown>) => tooltipEl.value?.setProps(value as never),
})
</script>

<template>
<VueTippy ref="tooltip" v-bind="bind">
	<slot />

	<template v-if="$slots.content" #content="slotProps">
		<slot name="content" v-bind="slotProps" />
	</template>
</VueTippy>
</template>
