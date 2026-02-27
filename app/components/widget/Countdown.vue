<script setup lang="ts">
const lunarInfo = '04bd8,04ae0,0a570,054d5,0d260,0d950,16554,056a0,09ad0,055d2,04ae0,0a5b6,0a4d0,0d250,1d255,0b540,0d6a0,0ada2,095b0,14977,04970,0a4b0,0b4b5,06a50,06d40,1ab54,02b60,09570,052f2,04970,06566,0d4a0,0ea50,06e95,05ad0,02b60,186e3,092e0,1c8d7,0c950,0d4a0,1d8a6,0b550,056a0,1a5b4,025d0,092d0,0d2b2,0a950,0b557,06ca0,0b550,15355,04da0,0a5d0,14573,052d0,0a9a8,0e950,06aa0,0aea6,0ab50,04b60,0aae4,0a570,05260,0f263,0d950,05b57,056a0,096d0,04dd5,04ad0,0a4d0,0d4d4,0d250,0d558,0b540,0b5a0,195a6,095b0,049b0,0a974,0a4b0,0b27a,06a50,06d40,0af46,0ab60,09570,04af5,04970,064b0,074a3,0ea50,06b58,055c0,0ab60,096d5,092e0,0c960,0d954,0d4a0,0da50,07552,056a0,0abb7,025d0,092d0,0cab5,0a950,0b4a0,0baa4,0ad50,055d9,04ba0,0a5b0,15176,052b0,0a930,07954,06aa0,0ad50,05b52,04b60,0a6e6,0a4e0,0d260,0ea65,0d530,05aa0,076a3,096d0,04bd7,04ad0,0a4d0,1d0b6,0d250,0d520,0dd45,0b5a0,056d0,055b2,049b0,0a577,0a4b0,0aa50,1b255,06d20,0ada0,14b63,09370,049f8,04970,064b0,168a6,0ea50,06b20,1a6c4,0aae0,0a2e0,0d2e3,0c960,0d557,0d4a0,0da50,05d55,056a0,0a6d0,055d4,052d0,0a9b8,0a950,0b4a0,0b6a6,0ad50,055a0,0aba4,0a5b0,052b0,0b273,06930,07337,06aa0,0ad50,14b55,04b60,0a570,054e4,0d160,0e968,0d520,0daa0,16aa6,056d0,04ae0,0a9d4,0a2d0,0d150,0f252,0d520'.split(',').map(hex => Number.parseInt(hex, 16))

const minYear = 1900
const maxYear = 2100

const units = [
	{ key: 'day', text: '今日', unit: '小时' },
	{ key: 'week', text: '本周', unit: '天' },
	{ key: 'month', text: '本月', unit: '天' },
	{ key: 'year', text: '本年', unit: '天' },
] as const

function getLunarYearDaysCount(year: number) {
	const yearInfo = lunarInfo[year - minYear] ?? 0
	let sum = 348
	for (let i = 0x8000; i > 0x8; i >>= 1)
		sum += yearInfo & i ? 1 : 0

	const leapMonth = yearInfo & 0xf
	if (leapMonth)
		sum += yearInfo & 0x10000 ? 30 : 29

	return sum
}

function getSpringFestivalDate(year: number) {
	if (year < minYear || year > maxYear)
		return null

	let offsetDays = 0
	for (let current = minYear; current < year; current += 1)
		offsetDays += getLunarYearDaysCount(current)

	return new Date(Date.UTC(minYear, 0, 31) + offsetDays * 86400000)
}

function resolveSpringFestivalDate(now: Date) {
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const thisYearDate = getSpringFestivalDate(now.getFullYear())
	if (thisYearDate && today <= thisYearDate)
		return thisYearDate
	return getSpringFestivalDate(now.getFullYear() + 1) || thisYearDate
}

function getDayProgress(now: Date) {
	const hours = now.getHours()
	return {
		remaining: 24 - hours,
		percentage: (hours / 24) * 100,
	}
}

function getWeekProgress(now: Date) {
	const day = now.getDay()
	const passed = day === 0 ? 6 : day - 1
	return {
		remaining: 6 - passed,
		percentage: ((passed + 1) / 7) * 100,
	}
}

function getMonthProgress(now: Date) {
	const total = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
	const passed = now.getDate() - 1
	return {
		remaining: total - passed,
		percentage: (passed / total) * 100,
	}
}

function getYearProgress(now: Date) {
	const start = new Date(now.getFullYear(), 0, 1)
	const total = isLeapYear(now.getFullYear()) ? 366 : 365
	const passed = Math.floor((now.getTime() - start.getTime()) / 86400000)
	return {
		remaining: total - passed,
		percentage: (passed / total) * 100,
	}
}

function isLeapYear(year: number) {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

const targetName = '春节'
const now = ref(new Date())
const hydrated = ref(false)

const targetDate = computed(() => resolveSpringFestivalDate(now.value))
const daysUntil = computed(() => {
	const target = targetDate.value
	if (!target)
		return '--'
	const today = new Date(now.value.getFullYear(), now.value.getMonth(), now.value.getDate())
	return Math.round((target.getTime() - today.getTime()) / 86400000)
})

const progressRows = computed(() => {
	const current = now.value
	const calculators = {
		day: getDayProgress,
		week: getWeekProgress,
		month: getMonthProgress,
		year: getYearProgress,
	} as const

	return units.map((item) => {
		const { remaining, percentage } = calculators[item.key](current)
		const opacity = Math.min(1, Math.max(0.62, percentage / 100))
		return {
			...item,
			remaining,
			percentage,
			style: {
				width: `${percentage}%`,
				opacity: `${opacity}`,
			},
			highlight: percentage >= 50,
		}
	})
})

const targetDateText = computed(() => {
	const target = targetDate.value
	if (!target)
		return '-'
	const year = target.getFullYear()
	const month = String(target.getMonth() + 1).padStart(2, '0')
	const day = String(target.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
})

let timer: ReturnType<typeof setInterval> | null = null

function startTimer() {
	if (timer)
		return
	timer = setInterval(() => {
		now.value = new Date()
	}, 10 * 60 * 1000)
}

function stopTimer() {
	if (!timer)
		return
	clearInterval(timer)
	timer = null
}

onMounted(() => {
	hydrated.value = true
	startTimer()
	document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
	stopTimer()
	document.removeEventListener('visibilitychange', onVisibilityChange)
})

function onVisibilityChange() {
	if (document.hidden) {
		stopTimer()
		return
	}
	now.value = new Date()
	startTimer()
}
</script>

<template>
<BlogWidget card title="倒计时">
	<div v-if="hydrated" class="countdown">
		<div class="left">
			<div class="text">距离</div>
			<div class="name">{{ targetName }}</div>
			<div class="days">{{ daysUntil }}</div>
			<div class="date">{{ targetDateText }}</div>
		</div>

		<div class="right">
			<div v-for="item in progressRows" :key="item.key" class="row">
				<div class="row-name">{{ item.text }}</div>
				<div class="bar-wrap">
					<div class="bar" :style="item.style" />
						<span class="percent" :class="{ 'on-bar': item.highlight }">{{ item.percentage.toFixed(2) }}%</span>
						<span class="remain" :class="{ 'on-bar': item.highlight }">还剩{{ item.remaining }}{{ item.unit }}</span>
				</div>
			</div>
		</div>
	</div>

	<div v-else class="countdown">
		<div class="left">
			<div class="text">距离</div>
			<div class="name">春节</div>
			<div class="days">--</div>
			<div class="date">----</div>
		</div>

		<div class="right">
			<div v-for="item in units" :key="item.key" class="row">
				<div class="row-name">{{ item.text }}</div>
				<div class="bar-wrap">
					<div class="bar" style="width: 0%; opacity: 0.62" />
					<span class="percent">--%</span>
					<span class="remain">还剩--{{ item.unit }}</span>
				</div>
			</div>
		</div>
	</div>
</BlogWidget>
</template>

<style lang="scss" scoped>
.countdown {
	display: flex;
	gap: .8rem;
}

.left {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	line-height: 1.5;
	min-width: 5.2rem;

	&::after {
		content: '';
		position: absolute;
		right: -.4rem;
		height: 80%;
		width: 2px;
		background-color: var(--c-border);
		opacity: .8;
	}
}

.text {
	font-size: .9rem;
	color: var(--c-text-2);
}

.name {
	font-size: 1.8rem;
	font-weight: 700;
	line-height: 1.2;
	color: var(--c-text-1);
}

.days {
	font-size: 2.2rem;
	font-weight: 800;
	line-height: 1.1;
	color: var(--c-primary);
}

.date {
	font-size: .85rem;
	color: var(--c-text-3);
}

.right {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	gap: .35rem;
}

.row {
	display: flex;
	align-items: center;
	gap: .45rem;
}

.row-name {
	font-size: .9rem;
	white-space: nowrap;
	color: var(--c-text-2);
}

.bar-wrap {
	position: relative;
	height: 1.9rem;
	flex: 1;
	border-radius: 8px;
	overflow: hidden;
	background-color: var(--c-bg-soft);
}

.bar {
	height: 100%;
	border-radius: 8px;
	background-color: var(--c-primary);
	transition: width .3s;
}

.percent,
.remain {
	position: absolute;
	inset-block-start: 50%;
	transform: translateY(-50%);
	font-size: .8rem;
	font-weight: 600;
	color: var(--c-text-2);
	transition: opacity .3s ease-in-out, transform .3s ease-in-out;
}

.percent {
	inset-inline-start: .45rem;
}

.remain {
	inset-inline-end: .45rem;
	opacity: 0;
	transform: translateY(-50%) translateX(.625rem);
}

.on-bar {
	color: var(--c-text);
}

.countdown:hover {
	.remain {
		opacity: 1;
		transform: translateY(-50%) translateX(0);
	}

	.percent {
		opacity: 0;
		transform: translateY(-50%) translateX(-.625rem);
	}
}

@media (max-width: 1300px) {
	.countdown {
		flex-direction: column;
	}

	.left {
		padding-bottom: .6rem;

		&::after {
			right: auto;
			left: 10%;
			bottom: 0;
			width: 80%;
			height: 1px;
		}
	}
}
</style>
