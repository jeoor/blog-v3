const BUSUANZI_IDS = ['busuanzi_site_uv', 'busuanzi_site_pv', 'busuanzi_page_pv']
const BUSUANZI_SRC = 'https://jsd.dusays.com/npm/penndu@17.0.0/bsz.js'

declare global {
	interface Window {
		__refreshBusuanzi?: () => void
	}
}

function hasEmptyCounters() {
	return BUSUANZI_IDS.some((id) => {
		const element = document.getElementById(id)
		if (!element)
			return false
		const text = element.textContent?.trim() || ''
		return !text || text === '--'
	})
}

function reloadBusuanziScript() {
	document.querySelectorAll('script[data-busuanzi-runtime="1"]').forEach(script => script.remove())

	const script = document.createElement('script')
	script.src = BUSUANZI_SRC
	script.async = true
	script.dataset.busuanziRuntime = '1'
	document.head.appendChild(script)
}

function scheduleBusuanziReload() {
	if (typeof window.requestIdleCallback === 'function') {
		window.requestIdleCallback(() => {
			if (hasEmptyCounters())
				reloadBusuanziScript()
		})
		return
	}

	window.setTimeout(() => {
		if (hasEmptyCounters())
			reloadBusuanziScript()
	}, 300)
}

export default defineNuxtPlugin((nuxtApp) => {
	if (!import.meta.client)
		return

	let firstPageFinished = false
	window.__refreshBusuanzi = () => {
		if (hasEmptyCounters())
			scheduleBusuanziReload()
	}

	nuxtApp.hook('page:finish', () => {
		setTimeout(() => {
			if (!firstPageFinished) {
				firstPageFinished = true
				window.__refreshBusuanzi?.()
				return
			}

			reloadBusuanziScript()
		}, 0)
	})
})
