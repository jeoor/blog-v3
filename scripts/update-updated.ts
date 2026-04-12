#!/usr/bin/env node

/**
 * 根据 git log 自动更新文章 frontmatter 中的 updated 字段
 *
 * 用法：pnpm updated [--dry-run]
 *
 * --dry-run  只输出变更，不写入文件
 */

import fs from 'node:fs'
import { execSync } from 'node:child_process'
import { globSync } from 'node:fs'
import { join } from 'node:path'

const DRY_RUN = process.argv.includes('--dry-run')

const POSTS_DIR = join('content', 'posts')
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/

interface FileResult {
	path: string
	updated: boolean
	oldDate?: string
	newDate: string
}

function getGitLastCommitDate(filePath: string): string | null {
	try {
		const output = execSync(
			`git log -1 --format=%ci -- ${filePath}`,
			{ encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
		).trim()

		if (!output)
			return null

		// git log %ci 格式: 2026-04-11 17:25:03 +0800
		const parts = output.split(' ')
		if (!parts[0] || !parts[1])
			return null
		return `${parts[0]} ${parts[1]}`
	}
	catch {
		return null
	}
}

function updateFrontmatter(filePath: string, gitDate: string): FileResult {
	const content = fs.readFileSync(filePath, 'utf-8')
	const NL = content.includes('\r\n') ? '\r\n' : '\n'
	const match = content.match(FRONTMATTER_RE)

	if (!match) {
		return { path: filePath, updated: false, newDate: gitDate }
	}

	const frontmatter = match[1]!
	const existingUpdated = frontmatter.match(/^updated:\s*(.+)$/m)?.[1]?.trim()

	// 已是最新则跳过（只比较日期，避免提交 updated 本身产生新时间戳导致死循环）
	if (existingUpdated?.split(' ')[0] === gitDate.split(' ')[0]) {
		return { path: filePath, updated: false, newDate: gitDate }
	}

	// 没有 updated 字段时在 date 后面插入
	if (!existingUpdated) {
		const dateLineMatch = frontmatter.match(/^(date:.+)$/m)
		if (dateLineMatch?.index != null) {
			const dateLineEnd = dateLineMatch.index + dateLineMatch[0].length
			const newFrontmatter = frontmatter.slice(0, dateLineEnd)
				+ `${NL}updated: ${gitDate}`
				+ frontmatter.slice(dateLineEnd)

			const newContent = content.replace(frontmatter, newFrontmatter)
			if (!DRY_RUN)
				fs.writeFileSync(filePath, newContent, 'utf-8')

			return { path: filePath, updated: true, newDate: gitDate }
		}

		return { path: filePath, updated: false, newDate: gitDate }
	}

	// 替换已有 updated
	const newFrontmatter = frontmatter.replace(
		/^updated:\s*.+$/m,
		`updated: ${gitDate}`,
	)
	const newContent = content.replace(frontmatter, newFrontmatter)
	if (!DRY_RUN)
		fs.writeFileSync(filePath, newContent, 'utf-8')

	return { path: filePath, updated: true, oldDate: existingUpdated, newDate: gitDate }
}

// 扫描所有文章
const files = globSync('**/*.md', { cwd: POSTS_DIR })
	.map(file => join(POSTS_DIR, file))

console.log(`扫描 ${files.length} 篇文章...\n`)

let changed = 0

for (const file of files) {
	const gitDate = getGitLastCommitDate(file)
	if (!gitDate)
		continue

	const result = updateFrontmatter(file, gitDate)

	if (result.updated) {
		changed += 1
		const arrow = result.oldDate
			? `${result.oldDate} → ${result.newDate}`
			: `（新增）${result.newDate}`

		if (DRY_RUN) {
			console.log(`[dry-run] ${file}: ${arrow}`)
		}
		else {
			console.log(`✓ ${file}: ${arrow}`)
		}
	}
}

console.log(`\n${DRY_RUN ? '[dry-run] ' : ''}共 ${changed} 篇文章已${DRY_RUN ? '待' : ''}更新`)
