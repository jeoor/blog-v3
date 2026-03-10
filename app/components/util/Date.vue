<script setup lang="ts">
import { Temporal } from 'temporal-polyfill'

const appConfig = useAppConfig()

const props = withDefaults(defineProps<{
	icon?: string
	date?: string | Temporal.ZonedDateTime
	format?: dateTimeFormatOptions
	absolute?: boolean
	relative?: boolean
	nospace?: boolean
	tipFormat?: dateTimeFormatOptions
	tipTransform?: (formattedDate: string) => string
}>(), {
	tipTransform: String,
})

const mounted = useMounted()

const zdt = computed(() => {
	try {
		return typeof props.date === 'string' ? toZonedTemporal(props.date) : props.date
	}
	catch {
		return null
	}
})

const today = computed(() => mounted.value ? Temporal.Now.plainDateISO() : null)

const relative = computed(() => props.absolute || !zdt.value
	? false
	: !today.value
		? false
		: props.relative || today.value.since(zdt.value, { largestUnit: 'week' }).weeks < 1,
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
