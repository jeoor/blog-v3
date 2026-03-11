import blogConfig from '~~/blog.config'

export type DateTimeUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'

export interface ZonedDateValue {
	date: Date
	epochMilliseconds: number
	year: number
	month: number
	day: number
	hour: number
	minute: number
	second: number
	timeZone: string
}

export type DateInput = string | Date | ZonedDateValue

interface ZonedDateParts {
	year: number
	month: number
	day: number
	hour: number
	minute: number
	second: number
}

const SECOND_IN_MS = 1000
const timeZone = blogConfig.timeZone
const zonedPartsFormatter = new Intl.DateTimeFormat('en-CA', {
	timeZone,
	hour12: false,
	hourCycle: 'h23',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
})
const formatterCache = new Map<string, Intl.DateTimeFormat>()
const naiveDateTimePattern = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2})(?::(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?)?$/

export function isSameUnit(date1: DateInput, date2: DateInput, unit: DateTimeUnit) {
	try {
		const left = toZonedTemporal(date1)
		const right = toZonedTemporal(date2)

		switch (unit) {
			case 'year':
				return left.year === right.year
			case 'month':
				return left.year === right.year && left.month === right.month
			case 'week':
				return getIsoWeekKey(left) === getIsoWeekKey(right)
			case 'day':
				return left.year === right.year && left.month === right.month && left.day === right.day
			case 'hour':
				return left.year === right.year
					&& left.month === right.month
					&& left.day === right.day
					&& left.hour === right.hour
			case 'minute':
				return left.year === right.year
					&& left.month === right.month
					&& left.day === right.day
					&& left.hour === right.hour
					&& left.minute === right.minute
			case 'second':
				return left.year === right.year
					&& left.month === right.month
					&& left.day === right.day
					&& left.hour === right.hour
					&& left.minute === right.minute
					&& left.second === right.second
		}
	}
	catch {
		return false
	}
}

/** 检查两个时间相对现在是否相差显著 */
export function isTimeDiffSignificant(
	date1?: DateInput,
	date2?: DateInput,
	/** 对于时间差的敏感程度，0~1 之间，1:不同则认为显著，>1:始终认为显著 */
	threshold = 0.6,
) {
	if (!date1 || !date2 || threshold <= 0)
		return false
	if (threshold > 1)
		return true
	try {
		const now = Date.now()
		const diff1 = now - toZonedTemporal(date1).epochMilliseconds
		const diff2 = now - toZonedTemporal(date2).epochMilliseconds
		return diff1 / diff2 < threshold || diff2 / diff1 < threshold
	}
	catch {
		return true
	}
}

const timeIntervals = [
	{ label: '世纪', threshold: 60 * 60 * 24 * 365.2422 * 100 },
	{ label: '年', threshold: 60 * 60 * 24 * 365.2422 },
	{ label: '个月', threshold: 60 * 60 * 24 * 30.44 },
	{ label: '天', threshold: 60 * 60 * 24 },
	{ label: '小时', threshold: 60 * 60 },
	{ label: '分', threshold: 60 },
	{ label: '秒', threshold: 1 },
]

export function timeElapse(date: DateInput, maxDepth = 2) {
	let timeString = ''
	let secRemained = Math.max(0, (Date.now() - toDate(date).getTime()) / SECOND_IN_MS)
	for (const interval of timeIntervals) {
		const count = Math.floor(secRemained / interval.threshold)
		if (count <= 0)
			continue
		timeString += `${count}${interval.label}`
		secRemained -= count * interval.threshold
		if (--maxDepth <= 0)
			break
	}
	return timeString || '刚刚'
}

export function toInstantString(date: DateInput) {
	return toDate(date).toISOString()
}

export function toZonedTemporal(date: DateInput) {
	if (isZonedDateValue(date))
		return date

	const normalizedDate = toDate(date)
	const parts = getZonedParts(normalizedDate)

	return {
		date: normalizedDate,
		epochMilliseconds: normalizedDate.getTime(),
		timeZone,
		...parts,
	}
}

export const dateTimeFormat = {
	date: {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	},
	monthDay: {
		month: '2-digit',
		day: '2-digit',
	},
	full: {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		weekday: 'long',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		timeZoneName: 'long',
	},
} satisfies Record<string, Intl.DateTimeFormatOptions>

export type dateTimeFormatOptions = keyof typeof dateTimeFormat | Intl.DateTimeFormatOptions

export function toZdtLocaleString(date: DateInput, format: dateTimeFormatOptions = 'full') {
	const options = typeof format === 'string' ? dateTimeFormat[format] : format
	const formatterKey = typeof format === 'string' ? format : JSON.stringify(options)
	let formatter = formatterCache.get(formatterKey)

	if (!formatter) {
		formatter = new Intl.DateTimeFormat(blogConfig.language, {
			...options,
			timeZone,
		})
		formatterCache.set(formatterKey, formatter)
	}

	return formatter.format(toDate(date))
}

function isZonedDateValue(value: unknown): value is ZonedDateValue {
	if (!value || typeof value !== 'object')
		return false

	const candidate = value as Partial<ZonedDateValue>
	return candidate.date instanceof Date && typeof candidate.epochMilliseconds === 'number'
}

function toDate(date: DateInput) {
	if (date instanceof Date)
		return date
	if (isZonedDateValue(date))
		return date.date
	return parseDateString(date)
}

function parseDateString(date: string) {
	const normalizedDate = date.trim().replace(/\[[^\]]+\]$/u, '')
	const naiveDateMatch = normalizedDate.match(naiveDateTimePattern)
	if (naiveDateMatch)
		return parseNaiveDate(naiveDateMatch)

	const parsedDate = new Date(normalizedDate.replace(/^(\d{4}-\d{2}-\d{2})\s/u, '$1T'))
	if (Number.isNaN(parsedDate.getTime()))
		throw new TypeError(`Invalid date: ${date}`)
	return parsedDate
}

function parseNaiveDate(match: RegExpMatchArray) {
	const year = Number.parseInt(match[1]!, 10)
	const month = Number.parseInt(match[2]!, 10)
	const day = Number.parseInt(match[3]!, 10)
	const hour = Number.parseInt(match[4] || '0', 10)
	const minute = Number.parseInt(match[5] || '0', 10)
	const second = Number.parseInt(match[6] || '0', 10)
	const millisecond = Number.parseInt((match[7] || '0').padEnd(3, '0'), 10)

	const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second, millisecond)
	let timeZoneOffset = getTimeZoneOffset(utcGuess)
	let timestamp = utcGuess - timeZoneOffset
	const adjustedOffset = getTimeZoneOffset(timestamp)

	if (adjustedOffset !== timeZoneOffset)
		timestamp = utcGuess - adjustedOffset

	return new Date(timestamp)
}

function getTimeZoneOffset(timestamp: number) {
	const date = new Date(timestamp)
	const parts = getZonedParts(date)
	const zonedTimestamp = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
	const utcTimestamp = Date.UTC(
		date.getUTCFullYear(),
		date.getUTCMonth(),
		date.getUTCDate(),
		date.getUTCHours(),
		date.getUTCMinutes(),
		date.getUTCSeconds(),
	)

	return zonedTimestamp - utcTimestamp
}

function getZonedParts(date: Date): ZonedDateParts {
	const partMap = Object.fromEntries(zonedPartsFormatter
		.formatToParts(date)
		.filter(part => part.type !== 'literal')
		.map(part => [part.type, part.value])) as Record<string, string>

	return {
		year: Number.parseInt(partMap.year!, 10),
		month: Number.parseInt(partMap.month!, 10),
		day: Number.parseInt(partMap.day!, 10),
		hour: Number.parseInt(partMap.hour!, 10),
		minute: Number.parseInt(partMap.minute!, 10),
		second: Number.parseInt(partMap.second!, 10),
	}
}

function getIsoWeekKey(date: ZonedDateValue) {
	const utcDate = new Date(Date.UTC(date.year, date.month - 1, date.day))
	const dayOfWeek = utcDate.getUTCDay() || 7
	utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayOfWeek)

	const weekYear = utcDate.getUTCFullYear()
	const yearStart = new Date(Date.UTC(weekYear, 0, 1))
	const week = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)

	return `${weekYear}-${week}`
}
