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

const TAG_CATEGORIES = {
  Length: ['Short', 'Medium', 'Long'],
  Difficulty: ['Easy', 'Normal', 'Hard'],
  Maturity: ['All Ages', 'Mature'],
  Type: ['Classic', 'Experimental', 'Remake'],
}

function getInitialTags() {
  const all: Record<string, string[]> = {}
  Object.entries(TAG_CATEGORIES).forEach(([cat]) => {
    all[cat] = []
  })
  return all
}

export default function FangameGrid({ fangames }: { fangames: Fangame[] }) {
  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>(getInitialTags())
  const [touchedCategories, setTouchedCategories] = useState<Record<string, boolean>>({})
  const [results, setResults] = useState<Fangame[]>(fangames)

  function toggleTag(category: string, tag: string) {
    setTouchedCategories(prev => ({ ...prev, [category]: true }))
    setSelectedTags(prev => {
      const tags = new Set(prev[category] || [])
      tags.has(tag) ? tags.delete(tag) : tags.add(tag)
      return { ...prev, [category]: Array.from(tags) }
    })
  }

  useEffect(() => {
    const fuse = new Fuse(fangames, {
      keys: ['title', 'description', 'tags'],
      threshold: 0.3,
    })
    let filtered = query.trim() ? fuse.search(query).map(m => m.item) : fangames

    // Gather all checked tags across all categories
    const checkedTags = Object.values(selectedTags).flat()

    if (checkedTags.length > 0) {
      // Filter: show games matching any checked tag, sorted by most matches
      filtered = filtered.filter(fg =>
        fg.tags.some(tag => checkedTags.includes(tag))
      )
      filtered = filtered.sort((a, b) => {
        const aMatches = a.tags.filter(tag => checkedTags.includes(tag)).length
        const bMatches = b.tags.filter(tag => checkedTags.includes(tag)).length
        return bMatches - aMatches
      })
    }
    // If no tags are checked, show all games (no filter)

    setResults(filtered)
  }, [query, fangames, selectedTags])

  return (
    <div>
      <div className="flex flex-col items-center mb-4">
        <h1 className="text-5xl font-extrabold mb-6 text-center tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
          Fangame Finder
        </h1>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search fangames..."
          className="border px-2 py-1 rounded bg-background text-foreground w-full max-w-md mb-4 text-center"
          autoComplete="off"
        />
        <div className="flex flex-wrap gap-4 justify-center w-full mb-4">
          {Object.entries(TAG_CATEGORIES).map(([category, tags]) => (
            <div key={category} className="relative">
              <details>
                <summary className="cursor-pointer px-2 py-1 border rounded bg-background text-foreground">{category}</summary>
                <div className="absolute bg-background border rounded shadow p-2 z-10">
                  {tags.map(tag => (
                    <label key={tag} className="block">
                      <input
                        type="checkbox"
                        checked={selectedTags[category]?.includes(tag) || false}
                        onChange={() => toggleTag(category, tag)}
                      />{' '}
                      {tag}
                    </label>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.map(game => (
          <a
            key={game.slug}
            href={`/blog/${game.slug}`}
            className="border rounded p-4 flex flex-col items-center bg-background shadow hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {game.banner && (
              <img
                src={game.banner}
                alt={game.title}
                className="w-32 h-32 object-cover rounded mb-2"
                loading="lazy"
              />
            )}
            <div className="font-bold text-lg text-foreground text-center">{game.title}</div>
            <p className="text-sm text-muted-foreground mb-2 text-center">{game.description}</p>
            <div className="flex flex-wrap gap-1 mt-2 justify-center">
              {game.tags.map(tag => (
                <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded px-2 py-0.5">{tag}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}