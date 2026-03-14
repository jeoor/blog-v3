const katexStylesheetHref = 'https://lib.baomitu.com/KaTeX/0.16.9/katex.min.css'
const katexClassPattern = /\bkatex(?:-display)?\b|math-(?:inline|display)|language-math\b/

function hasKatexMarker(value: string) {
	return katexClassPattern.test(value)
}

function bodyContainsKatex(value: unknown) {
	const stack: unknown[] = [value]
	const visited = new WeakSet<object>()

	while (stack.length > 0) {
		const current = stack.pop()

		if (!current)
			continue

		if (typeof current === 'string') {
			if (hasKatexMarker(current))
				return true
			continue
		}

		if (typeof current !== 'object')
			continue

		if (Array.isArray(current)) {
			stack.push(...current)
			continue
		}

		if (visited.has(current))
			continue

		visited.add(current)
		stack.push(...Object.values(current as Record<string, unknown>))
	}

	return false
}

export function useOptionalKatexStyles(content: MaybeRefOrGetter<{ body?: unknown } | null | undefined>) {
	const hasKatex = computed(() => bodyContainsKatex(toValue(content)?.body))

	useHead(() => hasKatex.value
		? {
				link: [
					{ key: 'katex-preconnect', rel: 'preconnect', href: 'https://lib.baomitu.com', crossorigin: '' },
					{ key: 'katex-stylesheet', rel: 'stylesheet', href: katexStylesheetHref },
				],
			}
		: {})

	return {
		hasKatex,
	}
}
