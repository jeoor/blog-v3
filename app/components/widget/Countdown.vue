<script setup lang="ts">
import type { CountdownUnitKey } from '~/utils/countdown'
import { getCountdownProgress, resolveSpringFestivalDate } from '~/utils/countdown'

const units = [
	{ key: 'day', text: '日', unit: '小时' },
	{ key: 'week', text: '周', unit: '天' },
	{ key: 'month', text: '月', unit: '天' },
	{ key: 'year', text: '年', unit: '天' },
] as const

const targetName = '春节'
const rawNow = useNow({ interval: 10 * 60 * 1000 })
const currentDate = computed(() => new Date(rawNow.value))

const targetDate = computed(() => resolveSpringFestivalDate(currentDate.value))
const daysUntil = computed(() => {
	const target = targetDate.value
	if (!target)
		return '--'

	const today = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), currentDate.value.getDate())
	return Math.round((target.getTime() - today.getTime()) / 86400000)
})

const progressRows = computed(() => units.map((item) => {
	const { remaining, percentage } = getCountdownProgress(item.key as CountdownUnitKey, currentDate.value)
	return {
		...item,
		remaining,
		percentage,
		style: { width: `${percentage}%` },
		highlight: percentage >= 50,
	}
}))

const targetDateText = computed(() => {
	const target = targetDate.value
	if (!target)
		return '-'

	const year = target.getFullYear()
	const month = String(target.getMonth() + 1).padStart(2, '0')
	const day = String(target.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
})
</script>

<template>
<BlogWidget card title="倒计时">
	<div class="countdown">
		<div class="left">
			<div class="text">
				距离
			</div>
			<div class="name">
				{{ targetName }}
			</div>
			<div class="days">
				{{ daysUntil }}
			</div>
			<div class="date">
				{{ targetDateText }}
			</div>
		</div>

		<div class="right">
			<div v-for="item in progressRows" :key="item.key" class="row">
				<div class="row-name">
					{{ item.text }}
				</div>
				<div class="bar-wrap">
					<div class="bar" :style="item.style" />
					<span class="percent" :class="{ 'on-bar': item.highlight }">{{ item.percentage.toFixed(2) }}%</span>
					<span class="remain" :class="{ 'on-bar': item.highlight }">剩余{{ item.remaining }}{{ item.unit }}</span>
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
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: relative;
	min-width: 5.2rem;
	line-height: 1.5;

	&::after {
		content: "";
		position: absolute;
		opacity: .8;
		right: -.4rem;
		width: 2px;
		height: 80%;
		background-color: var(--c-border);
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
}

.right {
	display: flex;
	flex: 1;
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
	flex: 1;
	position: relative;
	overflow: hidden;
	height: 1.9rem;
	border-radius: 8px;
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
	font-size: .8rem;
	font-weight: 600;
	color: var(--c-text-2);
	transform: translateY(-50%);
	transition: opacity .3s, transform .3s;
}

.percent {
	inset-inline-start: .45rem;
}

.remain {
	opacity: 0;
	inset-inline-end: .45rem;
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

@media (max-width: $breakpoint-mobile) {
	.countdown {
		flex-direction: column;
	}

	.left {
		padding-bottom: .6rem;

		&::after {
			right: auto;
			bottom: 0;
			left: 10%;
			width: 80%;
			height: 1px;
		}
	}
}
</style>
