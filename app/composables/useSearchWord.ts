export function useSearchWord() {
	const word = useState('search-word', () => '')
	const debouncedWord = refDebounced(word)

	return {
		word,
		debouncedWord,
	}
}
