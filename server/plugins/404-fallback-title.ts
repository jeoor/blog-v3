import { defineNitroPlugin } from 'nitropack/runtime'
import blogConfig from '../../blog.config'

const fallback404Title = `<title>页面不存在 | ${blogConfig.title}</title>`
const titleTagRE = /<title>[\s\S]*?<\/title>/u

export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook('render:html', (htmlContext, { event }) => {
		if (event.path !== '/404.html')
			return

		const titleIndex = htmlContext.head.findIndex(tag => titleTagRE.test(tag))

		if (titleIndex === -1) {
			htmlContext.head.push(fallback404Title)
			return
		}

		htmlContext.head[titleIndex] = htmlContext.head[titleIndex]!.replace(titleTagRE, fallback404Title)
	})
})