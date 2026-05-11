import blogConfig from '~~/blog.config'

const STORAGE_KEY = 'umami:stats'
const fallbackStats = {
	today_uv: 0,
	today_visits: 0,
	today_pv: 0,
	online_users: 0,
	yesterday_uv: 0,
	yesterday_visits: 0,
	yesterday_pv: 0,
	last_month_visits: 0,
	last_month_pv: 0,
	total_uv: 0,
	total_visits: 0,
	total_pv: 0,
}

type UmamiRange = 'today' | 'yesterday' | 'lastMonth' | 'total' | 'now'

function getTimeRangeConfig(range: UmamiRange) {
	const now = new Date()

	switch (range) {
		case 'today':
			return {
				startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(),
				endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime(),
			}
		case 'yesterday':
			return {
				startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime(),
				endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(),
			}
		case 'lastMonth':
			return {
				startAt: new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime(),
				endAt: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
			}
		case 'total':
		default:
			return {
				startAt: new Date(2000, 0, 1).getTime(),
				endAt: now.getTime(),
			}
	}
}

function getNum(value: unknown, fallback?: unknown) {
	const target = typeof value === 'object' && value !== null
		? (value as Record<string, unknown>).value ?? (value as Record<string, unknown>).count
		: value ?? fallback

	return Number.parseInt(String(target ?? 0), 10) || 0
}

function extractMetric(data: Record<string, unknown>, key: string) {
	const metrics = data.metrics as Record<string, { value?: number | string | null, count?: number | string | null }> | undefined
	const comparison = data.comparison as Record<string, unknown> | undefined

	if (data[key] != null)
		return getNum(data[key])

	if (metrics?.[key] != null)
		return getNum(metrics[key])

	if (comparison?.[key] != null)
		return getNum(comparison[key])

	return 0
}

export default defineCachedEventHandler(async (event) => {
	const umamiToken = process.env.UMAMI_TOKEN || process.env.NUXT_UMAMI_TOKEN
	const storage = useStorage('cache')

	setHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=86400')

	if (!umamiToken)
		throw new Error('Missing UMAMI_TOKEN')

	const umamiScript = blogConfig.scripts.find((item) => {
		return typeof item.src === 'string'
			&& item.src.endsWith('/script.js')
			&& typeof item['data-website-id'] === 'string'
	})

	if (!umamiScript || typeof umamiScript.src !== 'string' || typeof umamiScript['data-website-id'] !== 'string')
		throw new Error('Umami script config is missing in blog.config.ts')

	const baseUrl = new URL(umamiScript.src).origin
	const websiteId = umamiScript['data-website-id']
	const ranges: Exclude<UmamiRange, 'now'>[] = ['today', 'yesterday', 'lastMonth', 'total']

	try {
		const statsList = await Promise.all(ranges.map(async (range) => {
			const { startAt, endAt } = getTimeRangeConfig(range)
			const params = new URLSearchParams({
				startAt: String(startAt),
				endAt: String(endAt),
			})

			const url = `${baseUrl}/api/websites/${websiteId}/stats?${params}`
			const data = await $fetch<Record<string, unknown>>(url, {
				headers: {
					Authorization: `Bearer ${umamiToken}`,
					'Content-Type': 'application/json',
				},
				timeout: 15000,
			})

			return {
				visitors: extractMetric(data, 'visitors'),
				visits: extractMetric(data, 'visits'),
				pageviews: extractMetric(data, 'pageviews'),
			}
		}))

		const activeData = await $fetch<Record<string, unknown>>(`${baseUrl}/api/websites/${websiteId}/active`, {
			headers: {
				Authorization: `Bearer ${umamiToken}`,
				'Content-Type': 'application/json',
			},
			timeout: 15000,
		})

		const stats: Record<Exclude<UmamiRange, 'now'>, {
			visitors: number
			visits: number
			pageviews: number
		}> = {
			today: statsList[0]!,
			yesterday: statsList[1]!,
			lastMonth: statsList[2]!,
			total: statsList[3]!,
		}

		const result = {
			today_uv: stats.today.visitors,
			today_visits: stats.today.visits,
			today_pv: stats.today.pageviews,
			online_users: getNum(activeData.visitors),
			yesterday_uv: stats.yesterday.visitors,
			yesterday_visits: stats.yesterday.visits,
			yesterday_pv: stats.yesterday.pageviews,
			last_month_visits: stats.lastMonth.visits,
			last_month_pv: stats.lastMonth.pageviews,
			total_uv: stats.total.visitors,
			total_visits: stats.total.visits,
			total_pv: stats.total.pageviews,
		}

		Object.assign(fallbackStats, result)
		await storage.setItem(STORAGE_KEY, result)

		return result
	}
	catch (error) {
		console.error('[api/umami] fetch failed', error)
		const storedStats = await storage.getItem<typeof fallbackStats>(STORAGE_KEY)

		if (storedStats)
			return { ...fallbackStats, ...storedStats }

		return fallbackStats
	}
}, {
	maxAge: 60 * 10,
	swr: true,
})
