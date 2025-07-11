'use client'

import { useEffect, useState } from 'react'
import Fuse from 'fuse.js'

interface Fangame {
  title: string
  description: string
  tags: string[]
  slug: string
  banner?: string
}

export default function SearchBar({ fangames }: { fangames: Fangame[] }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Fangame[]>([])
  const [selected, setSelected] = useState<number>(-1)

  useEffect(() => {
    const fuse = new Fuse(fangames, {
      keys: ['title', 'description', 'tags'],
      threshold: 0.3,
    })

    if (query.trim()) {
      const matches = fuse.search(query)
      setResults(matches.map(m => m.item))
    } else {
      setResults([])
    }
    setSelected(-1)
  }, [query, fangames])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((prev) => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      if (selected >= 0 && results[selected]) {
        window.location.href = `/blog/${results[selected].slug}`
      } else if (results.length > 0) {
        window.location.href = `/blog/${results[0].slug}`
      }
      e.preventDefault()
    }
  }

  return (
    <div className="w-full max-w-lg relative">
      <input
        type="text"
        placeholder="Search fangames..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full rounded-md border px-3 py-2"
        autoComplete="off"
      />

      {results.length > 0 && (
        <ul className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-72 overflow-y-auto space-y-2">
          {results.map((game, idx) => (
            <li key={game.slug} className={selected === idx ? 'bg-blue-100 rounded' : ''}>
              <a
                href={`/blog/${game.slug}`}
                className="flex items-center gap-3 px-3 py-2 text-blue-600 hover:underline"
                tabIndex={-1}
              >
                {game.banner && (
                  <img
                    src={game.banner.replace('/src/content', '/content')}
                    alt={game.title + ' banner'}
                    className="w-12 h-12 object-cover rounded"
                    loading="lazy"
                  />
                )}
                <div>
                  <div className="font-medium">{game.title}</div>
                  <p className="text-sm text-gray-600">{game.description}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}