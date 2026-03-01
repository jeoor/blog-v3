const BUSUANZI_IDS = ['busuanzi_site_uv', 'busuanzi_site_pv', 'busuanzi_page_pv']

function hasEmptyCounters() {
	return BUSUANZI_IDS.some((id) => {
		const element = document.getElementById(id)
		if (!element)
			return false
		return !element.textContent?.trim()
	})
}

function reloadBusuanziScript() {
	const sourceScript = document.querySelector<HTMLScriptElement>('script[src*="penndu@17.0.0/bsz.js"]')
	if (!sourceScript?.src)
		return

	document.querySelectorAll('script[data-busuanzi-runtime="1"]').forEach(script => script.remove())

	const script = document.createElement('script')
	script.src = sourceScript.src
	script.async = true
	script.dataset.busuanziRuntime = '1'
	document.head.appendChild(script)
}

export default defineNuxtPlugin((nuxtApp) => {
	if (!import.meta.client)
		return

	let firstPageFinished = false

	nuxtApp.hook('page:finish', () => {
		setTimeout(() => {
			if (!firstPageFinished) {
				firstPageFinished = true
				if (hasEmptyCounters())
					reloadBusuanziScript()
				return
			}

			reloadBusuanziScript()
		}, 0)
	})
})
