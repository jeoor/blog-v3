import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import feedGroups from '../app/feeds'

type FriendItem = [name: string, link: string, avatar: string]

const blacklist = new Set(['敖苛记'])

function isFriendItem(item: FriendItem | null): item is FriendItem {
	return item !== null
}

function generateFcircleJson() {
	const outputPath = path.resolve(process.cwd(), 'public/friend.json')

	try {
		const seenLinks = new Set<string>()

		const friends = feedGroups.flatMap(group =>
			(group.entries ?? [])
				.filter(entry => !(entry as { error?: unknown }).error)
				.map((entry): FriendItem | null => {
					const name = (entry.title || entry.sitenick || entry.author || '').trim()
					const link = (entry.link || '').trim()
					const avatar = (entry.avatar || entry.icon || '').trim()

					if (!name || !link || !avatar)
						return null

					if (blacklist.has(name))
						return null

					if (seenLinks.has(link))
						return null

					seenLinks.add(link)

					return [name, link, avatar]
				})
				.filter(isFriendItem),
		)

		fs.mkdirSync(path.dirname(outputPath), { recursive: true })

		const friendData = { friends }

		fs.writeFileSync(outputPath, `${JSON.stringify(friendData, null, 2)}\n`, 'utf-8')

		console.log(`成功生成 ${friends.length} 个友链: ${outputPath}`)

		return friendData
	}
	catch (error) {
		console.error('错误:', error instanceof Error ? error.message : String(error))
		process.exit(1)
	}
}

generateFcircleJson()
