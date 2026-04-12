#!/usr/bin/env node

import type { EssayImageObject } from '../app/types/essay'
import fs from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { cancel, intro, isCancel, log, multiselect, outro, select, text } from '@clack/prompts'
import { Temporal } from 'temporal-polyfill'
import blogConfig from '../blog.config'

const ESSAY_PATH = join('app', 'essays.ts')
const POSITIVE_INTEGER_RE = /^[1-9]\d*$/

function exitIfCancel<T>(value: T | symbol): T {
	if (isCancel(value)) {
		cancel('已取消')
		process.exit(0)
	}

	return value
}

function normalize(value: string | undefined): string | undefined {
	return value?.trim() || undefined
}

function q(value: string): string {
	return JSON.stringify(value)
}

function parseDimension(value?: string): number | undefined {
	if (!value) {
		return undefined
	}

	return Number(value)
}

function isImageObject(image: string | EssayImageObject): image is EssayImageObject {
	return typeof image !== 'string'
}

const now = Temporal.Now.zonedDateTimeISO(blogConfig.timeZone).toPlainDateTime()
const dateStr = now.toString({ smallestUnit: 'minute' }).slice(0, 16)

intro(`新建说说 — ${dateStr}`)

const text_ = normalize(exitIfCancel(await text({
	message: '说说内容（支持 HTML，可留空）',
	placeholder: '今天...',
})))

const imageInput = normalize(exitIfCancel(await text({
	message: '图片 URL（多张用空格隔开，留空跳过）',
	placeholder: 'https://bu.dusays.com/...',
})))

const imageUrls = imageInput ? imageInput.split(/\s+/).filter(Boolean) : []
const images = await collectImageMetadata(imageUrls)

const linkInput = normalize(exitIfCancel(await text({
	message: '链接卡片 URL（留空跳过）',
	placeholder: 'https://example.com',
})))

let linkCard = ''
if (linkInput) {
	const linkTitle = normalize(exitIfCancel(await text({
		message: '链接标题',
		placeholder: '网站名称',
		validate: val => val?.trim() === '' ? '链接标题不能为空' : undefined,
	})))

	if (linkTitle) {
		const linkDesc = normalize(exitIfCancel(await text({
			message: '链接描述（留空跳过）',
			placeholder: '简短描述',
		})))
		const linkIcon = normalize(exitIfCancel(await text({
			message: '链接图标 URL（留空跳过）',
			placeholder: 'https://example.com/icon.png',
		})))
		linkCard = buildLinkCard(linkInput, linkTitle, linkDesc, linkIcon)
	}
}

const videoType = exitIfCancel(await select({
	message: '视频类型（留空跳过）',
	options: [
		{ value: '', label: '不添加视频' },
		{ value: 'bilibili', label: 'Bilibili' },
		{ value: 'bilibili-nano', label: 'Bilibili Nano' },
		{ value: 'youtube', label: 'YouTube' },
		{ value: 'douyin', label: '抖音' },
		{ value: 'douyin-wide', label: '抖音（横版）' },
		{ value: 'tiktok', label: 'TikTok' },
		{ value: 'raw', label: '原始视频链接（raw）' },
	],
}))

let videoBlock = ''
if (videoType) {
	const videoId = normalize(exitIfCancel(await text({
		message: '视频 ID / 链接',
		placeholder: videoType === 'raw' ? 'https://example.com/video.mp4' : 'BV1xx411c7mD',
		validate: val => val?.trim() ? undefined : '视频 ID / 链接不能为空',
	})))

	if (videoId) {
		const videoRatio = normalize(exitIfCancel(await text({
			message: '视频比例 ratio（留空跳过）',
			placeholder: '16 / 9',
		})))
		const videoPoster = normalize(exitIfCancel(await text({
			message: '视频封面 poster（留空跳过）',
			placeholder: 'https://example.com/poster.webp',
		})))

		videoBlock = buildVideoBlock(videoType, videoId, videoRatio, videoPoster)
	}
}

const tags = exitIfCancel(await multiselect({
	message: '选择标签（空格选中，回车确认）',
	options: [
		{ value: '生活', label: '生活' },
		{ value: '网站', label: '网站' },
		{ value: '想法', label: '想法' },
		{ value: '技术', label: '技术' },
		{ value: '分享', label: '分享' },
	],
	required: false,
}))

if (!text_ && images.length === 0 && !linkCard && !videoBlock && tags.length === 0) {
	cancel('至少填写内容、图片、链接卡片、视频、标签中的一项')
	process.exit(0)
}

const lines: string[] = ['\t{']

if (text_) {
	lines.push(`\t\ttext: ${q(text_)},`)
}

lines.push(`\t\tdate: '${dateStr}',`)

if (images.length > 0) {
	lines.push('\t\timages: [')
	for (const image of images) {
		lines.push(buildImageEntry(image))
	}
	lines.push('\t\t],')
}

if (linkCard) {
	lines.push(linkCard)
}

if (videoBlock) {
	lines.push(videoBlock)
}

if (tags.length > 0) {
	lines.push(`\t\ttags: [${tags.map(tag => q(tag)).join(', ')}],`)
}

lines.push('\t},')

const newEntry = lines.join('\n')
const src = fs.readFileSync(ESSAY_PATH, 'utf-8')
const insertAfter = 'const essays: EssayItem[] = ['
const insertIndex = src.indexOf(insertAfter)

if (insertIndex === -1) {
	log.error(`在 ${ESSAY_PATH} 中找不到 "${insertAfter}" 标记`)
	process.exit(1)
}

const pos = src.indexOf('\n', insertIndex) + 1
const updated = `${src.slice(0, pos)}${newEntry}\n${src.slice(pos)}`

fs.writeFileSync(ESSAY_PATH, updated, 'utf-8')
log.success(`已写入 ${ESSAY_PATH}`)
outro('说说创建完成 🎉')

async function collectImageMetadata(urls: string[]): Promise<Array<string | EssayImageObject>> {
	const images: Array<string | EssayImageObject> = []

	for (const [index, url] of urls.entries()) {
		const alt = normalize(exitIfCancel(await text({
			message: `第 ${index + 1} 张图片 alt（留空跳过）`,
			placeholder: '图片描述',
		})))
		const width = parseDimension(normalize(exitIfCancel(await text({
			message: `第 ${index + 1} 张图片 width（留空跳过）`,
			placeholder: '320',
			validate: (val) => {
				const normalized = normalize(val)
				if (!normalized) {
					return undefined
				}

				return POSITIVE_INTEGER_RE.test(normalized) ? undefined : '请输入正整数'
			},
		}))))
		const height = parseDimension(normalize(exitIfCancel(await text({
			message: `第 ${index + 1} 张图片 height（留空跳过）`,
			placeholder: '240',
			validate: (val) => {
				const normalized = normalize(val)
				if (!normalized) {
					return undefined
				}

				return POSITIVE_INTEGER_RE.test(normalized) ? undefined : '请输入正整数'
			},
		}))))

		if (!alt && !width && !height) {
			images.push(url)
			continue
		}

		images.push({
			src: url,
			alt,
			width,
			height,
		})
	}

	return images
}

function buildImageEntry(image: string | EssayImageObject): string {
	if (!isImageObject(image)) {
		return `\t\t\t${q(image)},`
	}

	const fields = [
		`\t\t\t\tsrc: ${q(image.src)},`,
		image.alt ? `\t\t\t\talt: ${q(image.alt)},` : null,
		image.width ? `\t\t\t\twidth: ${image.width},` : null,
		image.height ? `\t\t\t\theight: ${image.height},` : null,
	].filter(Boolean).join('\n')

	return `\t\t\t{\n${fields}\n\t\t\t},`
}

function buildLinkCard(link: string, title: string, description?: string, icon?: string): string {
	const fields = [
		`\t\t\t\tlink: ${q(link)},`,
		`\t\t\t\ttitle: ${q(title)},`,
		description ? `\t\t\t\tdescription: ${q(description)},` : null,
		icon ? `\t\t\t\ticon: ${q(icon)},` : null,
	].filter(Boolean).join('\n')

	return `\t\tlinkCards: [\n\t\t\t{\n${fields}\n\t\t\t},\n\t\t],`
}

function buildVideoBlock(type: string, id: string, ratio?: string, poster?: string): string {
	const fields = [
		`\t\t\ttype: ${q(type)},`,
		`\t\t\tid: ${q(id)},`,
		ratio ? `\t\t\tratio: ${q(ratio)},` : null,
		poster ? `\t\t\tposter: ${q(poster)},` : null,
	].filter(Boolean).join('\n')

	return `\t\tvideo: {\n${fields}\n\t\t},`
}
