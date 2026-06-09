#!/usr/bin/env node

/**
 * 根据 git log 自动更新文章 frontmatter 中的 updated 字段
 *
 * 用法：pnpm updated [--dry-run]
 *
 * --dry-run  只输出变更，不写入文件
 */

import { execSync } from 'node:child_process'
import fs, { globSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const DRY_RUN = process.argv.includes('--dry-run')

const POSTS_DIR = join('content', 'posts')
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/

interface FileResult {
	path: string
	updated: boolean
	oldDate?: string
	newDate: string
}

interface CommitEntry {
	hash: string
	date: string
}

function shellQuote(value: string): string {
	return `"${value.replaceAll('"', '\\"')}"`
}

function normalizeGitCommitDate(raw: string): string | null {
	const parts = raw.trim().split(' ')
	if (!parts[0] || !parts[1])
		return null
	return `${parts[0]} ${parts[1]}`
}

function getGitLastCommitDate(filePath: string): string | null {
	try {
		const output = execSync(
			`git log -1 --format=%ci -- ${shellQuote(filePath)}`,
			{ encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
		).trim()

		if (!output)
			return null

		return normalizeGitCommitDate(output)
	}
	catch {
		return null
	}
}

function getGitCommitHistory(filePath: string): CommitEntry[] {
	try {
		const output = execSync(
			`git log --format=%H|%ci -- ${shellQuote(filePath)}`,
			{ encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
		).trim()

		if (!output)
			return []

		return output
			.split(/\r?\n/)
			.map((line) => {
				const [hash, rawDate] = line.split('|')
				const date = rawDate ? normalizeGitCommitDate(rawDate) : null
				if (!hash || !date)
					return null

				return { hash, date }
			})
			.filter((entry): entry is CommitEntry => entry !== null)
	}
	catch {
		return []
	}
}

function isUpdatedOnlyCommit(filePath: string, commitHash: string): boolean {
	try {
		const output = execSync(
			`git show --format= --unified=0 ${commitHash} -- ${shellQuote(filePath)}`,
			{ encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
		)

		const changedLines = output
			.split(/\r?\n/)
			.filter(line => /^[+-]/.test(line))
			.filter(line => !/^\+\+\+|^---/.test(line))
			.filter(line => !/^[+-]updated:\s*/.test(line.trim()))

		return changedLines.length === 0
	}
	catch {
		return false
	}
}

function getLastMeaningfulCommitDate(filePath: string): string | null {
	const commits = getGitCommitHistory(filePath)

	for (const commit of commits) {
		if (!isUpdatedOnlyCommit(filePath, commit.hash))
			return commit.date
	}

	return getGitLastCommitDate(filePath)
}

function updateFrontmatter(filePath: string, nextDate: string): FileResult {
	const content = fs.readFileSync(filePath, 'utf-8')
	const NL = content.includes('\r\n') ? '\r\n' : '\n'
	const match = content.match(FRONTMATTER_RE)

	if (!match) {
		return { path: filePath, updated: false, newDate: nextDate }
	}

	const frontmatter = match[1]!
	// eslint-disable-next-line regexp/no-super-linear-backtracking
	const existingUpdated = frontmatter.match(/^updated:\s+(.+)$/m)?.[1]?.trim()

	if (existingUpdated === nextDate) {
		return { path: filePath, updated: false, newDate: nextDate }
	}

	// 没有 updated 字段时在 date 后面插入
	if (!existingUpdated) {
		const dateLineMatch = frontmatter.match(/^(date:.+)$/m)
		if (dateLineMatch?.index != null) {
			const dateLineEnd = dateLineMatch.index + dateLineMatch[0].length
			const newFrontmatter = `${frontmatter.slice(0, dateLineEnd)
			}${NL}updated: ${nextDate}${
				frontmatter.slice(dateLineEnd)}`

			const newContent = content.replace(frontmatter, newFrontmatter)
			if (!DRY_RUN)
				fs.writeFileSync(filePath, newContent, 'utf-8')

			return { path: filePath, updated: true, newDate: nextDate }
		}

		return { path: filePath, updated: false, newDate: nextDate }
	}

	// 替换已有 updated
	const newFrontmatter = frontmatter.replace(
		/^updated:\s*(?:\S.*|[\t\v\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF])$/m,
		`updated: ${nextDate}`,
	)
	const newContent = content.replace(frontmatter, newFrontmatter)
	if (!DRY_RUN)
		fs.writeFileSync(filePath, newContent, 'utf-8')

	return { path: filePath, updated: true, oldDate: existingUpdated, newDate: nextDate }
}

// 扫描所有文章
const files = globSync('**/*.md', { cwd: POSTS_DIR })
	.map(file => join(POSTS_DIR, file))

console.log(`扫描 ${files.length} 篇文章...\n`)

let changed = 0

for (const file of files) {
	const date = getLastMeaningfulCommitDate(file)
	if (!date)
		continue

	const result = updateFrontmatter(file, date)

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
