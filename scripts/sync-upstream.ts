/**
 * sync-upstream.ts
 *
 * 同步上游 (upstream) 变更，保留本地 WIP。
 *
 * 用法:
 *   pnpm upstream          保存 WIP → fetch → merge upstream → 恢复 WIP
 *   pnpm upstream:restore  仅恢复 stash（冲突手动解决后使用）
 */

import { execSync } from 'node:child_process'
import process from 'node:process'

const args = process.argv.slice(2)
const restoreOnly = args.includes('--restore')

const SEP = '='.repeat(48)

// ── 工具函数 ──────────────────────────────────────
function run(cmd: string, silent?: boolean): string {
	try {
		return (execSync(cmd, { encoding: 'utf-8', stdio: silent ? 'pipe' : 'inherit' }) ?? '').trim()
	}
	catch (err: any) {
		if (err.stderr)
			process.stderr.write(err.stderr)
		throw err
	}
}

function fatal(msg: string, code = 1) {
	console.error(msg)
	process.exit(code)
}

function log(emoji: string, msg: string) {
	console.log(`  ${emoji}  ${msg}`)
}

// ── 获取 upstream 默认分支 ──
function getUpstreamBranch(): string {
	try {
		return run('git symbolic-ref refs/remotes/upstream/HEAD', true).replace('refs/remotes/', '')
	}
	catch {
		for (const b of ['upstream/main', 'upstream/master']) {
			try {
				run(`git rev-parse --verify ${b}`, true)
				return b
			}
			catch { /* continue */ }
		}
		fatal('[ERROR] 无法确定 upstream 默认分支')
		return '' // unreachable
	}
}

// ── 从 stash list 中按消息前缀找到匹配的 ref ──
function findStash(prefix: string): string | null {
	const list = run('git stash list --format="%gd %gs"', true)
	if (!list)
		return null
	const line = list.split('\n').find(l => l.startsWith('stash@{') && l.includes(prefix))
	if (!line)
		return null
	return line.split(' ')[0] ?? null // stash@{N}
}

// ── --restore：仅恢复 stash ──
if (restoreOnly) {
	console.log()
	console.log(SEP)
	console.log('  恢复 WIP')
	console.log(SEP)
	console.log()

	const ref = findStash('sync-upstream: WIP')
	if (!ref) {
		log('[INFO]', '没有 sync-upstream 的 stash')
		const list = run('git stash list', true)
		if (list)
			console.log(`\n  ${list.split('\n').join('\n  ')}`)
		process.exit(0)
	}

	log('[INFO]', `恢复: ${ref}`)
	try {
		run(`git stash apply ${ref}`)
		run(`git stash drop ${ref}`)
		log('[OK]', '完成')
	}
	catch {
		fatal('\n[ERROR] 冲突！手动解决后 git stash drop')
	}
	process.exit(0)
}

// ── 正常流程 ──

// 0. 前置检查
try {
	run('git remote get-url upstream', true)
}
catch {
	fatal('[ERROR] 没有 upstream remote，请先添加：\n   git remote add upstream <url>')
}

const branch = run('git branch --show-current', true)
if (!branch)
	fatal('[ERROR] 当前处于 detached HEAD，无法同步')

try {
	run('git rev-parse --verify -q MERGE_HEAD', true)
	fatal('[ERROR] 有未完成的 merge，请先完成或 abort')
}
catch { /* ok */ }
try {
	run('git rev-parse --verify -q REBASE_HEAD', true)
	fatal('[ERROR] 有未完成的 rebase，请先完成或 abort')
}
catch { /* ok */ }

const upstreamBranch = getUpstreamBranch()

console.log()
console.log(SEP)
console.log(`  上游同步  ·  ${branch}  <-  ${upstreamBranch}`)
console.log(SEP)
console.log()

// 1. 清理旧的 sync-upstream stash
const oldCount = run('git stash list --format="%gd %gs"', true)
	.split('\n')
	.filter(l => l && l.includes('sync-upstream: WIP'))
	.length
for (let i = 0; i < oldCount; i++) {
	run('git stash drop stash@{0}', true)
}
if (oldCount > 0)
	log('[CLEAN]', `清理了 ${oldCount} 个旧 stash`)

// 2. Stash WIP
const ts = Date.now().toString(36)
const dirty = run('git status --porcelain', true)
const hasChanges = dirty.length > 0
const stashRef = `sync-upstream: WIP ${ts}`

if (hasChanges) {
	log('[STASH]', 'Stash 本地变更 ...')
	for (const l of dirty.split('\n')) console.log(`      ${l}`)
	console.log()
	run(`git stash push --include-untracked -m "${stashRef}"`)
	log('[OK]', `已保存: "${stashRef}"`)
}
else {
	log('[OK]', '工作区干净')
}

// 3. Fetch
log('[FETCH]', 'Fetch upstream --prune ...')
run('git fetch upstream --prune')

// 4. Merge
const behind = run(`git rev-list --count HEAD..${upstreamBranch}`, true)
if (behind === '0') {
	log('[OK]', '已是最新')
}
else {
	log('[MERGE]', `Merge ${upstreamBranch}（领先 ${behind} commit）`)
	console.log()
	run(`git log --oneline --no-decorate HEAD..${upstreamBranch}`)
	console.log()

	try {
		run(`git merge --ff ${upstreamBranch}`)
	}
	catch {
		console.error()
		console.error('[ERROR] 冲突！解决后：')
		console.error('   git add <file> && git merge --continue')
		console.error('   pnpm upstream:restore')
		console.error()
		console.error('  放弃: git merge --abort')
		process.exit(1)
	}
	log('[OK]', 'Merge 完成')
}

// 5. 恢复 WIP
if (hasChanges) {
	log('[STASH]', '恢复 WIP ...')

	const ref = findStash(stashRef)
	if (!ref)
		fatal('[ERROR] 找不到 stash，请手动 git stash apply')

	try {
		run(`git stash apply ${ref}`)
		run(`git stash drop ${ref}`)
		log('[OK]', '完成')
	}
	catch {
		console.error()
		console.error('[ERROR] Apply 冲突！改动已部分应用（带冲突标记）。')
		console.error('   解决后: git stash drop')
		console.error(`   （stash ${ref} 仍保留）`)
		process.exit(1)
	}
}

// 6. 检查残余冲突标记
try {
	run('git diff --check', true)
}
catch {
	console.error()
	console.error('[WARN] 检测到冲突标记（<<<<<<< / ======= / >>>>>>>），请检查！')
}

// 7. 最终状态
console.log()
run('git status --short')
console.log()
console.log(SEP)
console.log('  同步完成')
console.log(SEP)
console.log()
