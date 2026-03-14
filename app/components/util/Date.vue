<script setup lang="ts">
import type { ZonedDateValue } from '~/shared/utils/time'

const props = withDefaults(defineProps<{
	icon?: string
	date?: string | Date | ZonedDateValue
	format?: dateTimeFormatOptions
	absolute?: boolean
	relative?: boolean
	nospace?: boolean
	tipFormat?: dateTimeFormatOptions
	tipTransform?: (formattedDate: string) => string
}>(), {
	tipTransform: String,
})

const appConfig = useAppConfig()

const mounted = useMounted()

const zdt = computed(() => {
	try {
		return props.date ? toZonedTemporal(props.date) : null
	}
	catch {
		return null
	}
})

const today = computed(() => mounted.value ? toZonedTemporal(new Date()) : null)

const relative = computed(() => props.absolute || !zdt.value
	? false
	: !today.value
			? false
			: props.relative || Math.abs(today.value.epochMilliseconds - zdt.value.epochMilliseconds) < 7 * 24 * 60 * 60 * 1000,
)

const tooltip = computed(() => zdt.value
	? props.tipTransform(toZdtLocaleString(zdt.value, props.tipFormat))
	: props.date as string,
)
</script>

<template>
<span :title="tooltip">
	<Icon v-if="icon" :name="icon" />
	<template v-if="icon && !nospace">&nbsp;</template>

	<span v-if="!zdt">Invalid Date</span>

	<time
		v-else-if="format"
		:datetime="toInstantString(zdt)"
		v-text="toZdtLocaleString(zdt, format)"
	/>

	<NuxtTime
		v-else
		:datetime="toInstantString(zdt)"
		:locale="appConfig.language"
		:relative
		year="numeric"
		month="long"
		day="numeric"
		numeric="auto"
	/>
</span>
</template>
