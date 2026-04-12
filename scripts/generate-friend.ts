import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import feedGroups from '../app/feeds'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function generateFcircleJson() {
	const blacklist = ['敖苛记']
	const outputPath = path.resolve(__dirname, '../public/friend.json')

	try {
		const friends = feedGroups.flatMap(group =>
			group.entries
				.filter(entry => !(entry as any).error)
				.map((entry) => {
					const name = entry.title || entry.sitenick || entry.author
					const avatar = entry.avatar || entry.icon || ''
					if (!name || !entry.link || !avatar) {
						return null
					}
					return blacklist.includes(name) ? null : [name, entry.link, avatar]
				})
				.filter(Boolean),
		)

		const publicDir = path.resolve(__dirname, '../public')
		if (!fs.existsSync(publicDir))
			fs.mkdirSync(publicDir, { recursive: true })

		const friendData = { friends }
		fs.writeFileSync(outputPath, JSON.stringify(friendData, null, 2), 'utf-8')
		console.log(`成功生成 ${friends.length} 个友链: ${outputPath}`)
		return friendData
	}
	catch (error) {
		console.error('错误:', error instanceof Error ? error.message : String(error))
		process.exit(1)
	}
}

function isMainModule() {
	if (!process.argv[1])
		return false
	return path.resolve(process.argv[1]) === __filename
}

if (isMainModule()) {
	generateFcircleJson()
}
