<script setup lang="ts">
const SOURCE_URL = 'https://www.a1k0n.net/2011/07/20/donut-math.html'
const SOURCE_NAME = 'a1k0n — Donut math: how donut.c works'
const WIDTH = 80
const HEIGHT = 23
const BANNER_LINES = [
	'    _    / __ \\    _               _  _                                          ',
	'   (_)  / / _` |  | |__   __ _    | || |    _ _    ___             __     _ _    ',
	'   | |  \\ \\__,_|  | / /  / _` |    \\_, |   | \'_|  / _ \\     _     / _|   | \' \\   ',
	'  _|_|_  \\____/   |_\\_\\  \\__,_|   _|__/   _|_|_   \\___/   _(_)_   \\__|_  |_||_|  ',
	'_|"""""|_|"""""|_|"""""|_|"""""|_| """"|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| ',
	'"`-0-0-\'"`-0-0-\'"`-0-0-\'"`-0-0-\'"`-0-0-\'"`-0-0-\'"`-0-0-\'"`-0-0-\'"`-0-0-\'"`-0-0-\' ',
]
const BANNER_WIDTH = Math.max(...BANNER_LINES.map(line => line.length))
const BANNER_SPEED = 0.27
const SIZE = WIDTH * HEIGHT
const CHARS = '.,-~:;=!*#$@'
const THETA_SPACING = 0.07
const PHI_SPACING = 0.02
const R1 = 1
const R2 = 2
const FRAME_MS = 50

const frame = ref('')
const { pause, resume, isActive: isPlaying } = useIntervalFn(draw, FRAME_MS, { immediate: false })

let A = 0
let B = 0
let bannerOffset = WIDTH - Math.floor((WIDTH - BANNER_WIDTH) / 2)

function drawText(output: string[], lines: string[], top: number, left: number): void {
	for (const [row, line] of lines.entries()) {
		for (let column = 0; column < line.length; column += 1) {
			const x = left + column
			const y = top + row

			if (x >= 0 && x < WIDTH - 1 && y >= 0 && y < HEIGHT && line[column] !== ' ')
				output[x + WIDTH * y] = line[column]!
		}
	}
}

function draw(): void {
	const output: string[] = Array.from({ length: SIZE }, (_, index) =>
		index % WIDTH === WIDTH - 1 ? '\n' : ' ')
	const zBuffer = Array.from<number>({ length: SIZE }).fill(0)
	const e = Math.sin(A)
	const n = Math.sin(B)
	const g = Math.cos(A)
	const m = Math.cos(B)
	const bannerLeft = WIDTH - Math.trunc(bannerOffset % (WIDTH + BANNER_WIDTH))

	drawText(output, BANNER_LINES, 0, bannerLeft)

	for (let j = 0; j < 6.28; j += THETA_SPACING) {
		const d = Math.cos(j)
		const f = Math.sin(j)

		for (let i = 0; i < 6.28; i += PHI_SPACING) {
			const c = Math.sin(i)
			const h = R1 * d + R2
			const D = 15 / (c * h * e + f * g + 5)
			const l = Math.cos(i)
			const t = c * h * g - f * e
			const x = Math.trunc(40 + 2 * D * (l * h * m - t * n))
			const y = Math.trunc(12 + D * (l * h * n + t * m))
			const index = x + WIDTH * y
			const N = Math.trunc(8 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n))

			if (y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH - 1 && D > zBuffer[index]!) {
				zBuffer[index] = D
				output[index] = CHARS[Math.min(CHARS.length - 1, Math.max(N, 0))]!
			}
		}
	}

	frame.value = output.join('')
	A += 0.053
	B += 0.03
	bannerOffset += BANNER_SPEED
}

function toggle(): void {
	if (isPlaying.value)
		pause()
	else
		resume()
}

onMounted(() => {
	draw()
	resume()
})
</script>

<template>
<figure class="about-donut">
	<pre class="donut-frame" aria-label="donut.js" v-text="frame" />
	<figcaption class="donut-meta">
		<button
			type="button"
			class="donut-toggle"
			:title="isPlaying ? '暂停' : '播放'"
			:aria-label="isPlaying ? '暂停 donut 动画' : '播放 donut 动画'"
			@click="toggle"
		>
			<Icon v-if="isPlaying" name="tabler:player-pause" />
			<Icon v-else name="tabler:player-play" />
		</button>
		<ProseA class="donut-source" :href="SOURCE_URL" :icon="false">
			{{ SOURCE_NAME }}
		</ProseA>
	</figcaption>
</figure>
</template>

<style lang="scss" scoped>
.about-donut {
	margin: 0 0 2.5rem;
	text-align: center;
}

.donut-frame {
	overflow: hidden;
	margin: 0;
	font-family: var(--font-monospace);
	font-size: 0.55rem;
	letter-spacing: 0;
	line-height: 1;
	white-space: pre;
	text-align: center;
	color: var(--c-text-2);
}

.donut-meta {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	margin: 0.75rem 0 0;
	font-size: 0.85rem;
	line-height: 1.8;
	word-break: break-all;
}

.donut-toggle {
	display: inline-flex;
	flex: 0 0 auto;
	align-items: center;
	justify-content: center;
	padding: 0.25em;
	color: var(--c-text-2);
	transition: color var(--delay);
	cursor: pointer;

	&:hover {
		color: var(--c-primary);
	}
}

@media (max-width: $breakpoint-mobile) {
	.donut-frame {
		font-size: 0.43rem;
	}
}

@media (max-width: $breakpoint-phone) {
	.donut-frame {
		font-size: 0.34rem;
	}
}
</style>
