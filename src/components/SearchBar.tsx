'use client'

import { useEffect, useRef, useState } from 'react'
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

export default function SearchBar({ fangames }: { fangames: Fangame[] }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Fangame[]>([])
  const [selected, setSelected] = useState<number>(-1)
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)

  // Handle tag selection
  function toggleTag(category: string, tag: string) {
    setSelectedTags(prev => {
      const tags = new Set(prev[category] || [])
      tags.has(tag) ? tags.delete(tag) : tags.add(tag)
      return { ...prev, [category]: Array.from(tags) }
    })
  }

  // Filter logic
  useEffect(() => {
    const fuse = new Fuse(fangames, {
      keys: ['title', 'description', 'tags'],
      threshold: 0.3,
    })
    let filtered = query.trim() ? fuse.search(query).map(m => m.item) : fangames

    // Filter by selected tags
    Object.entries(selectedTags).forEach(([category, tags]) => {
      if (tags.length > 0) {
        filtered = filtered.filter(fg =>
          tags.some(tag => fg.tags.includes(tag))
        )
      }
    })

    setResults(filtered)
    setSelected(-1)
  }, [query, fangames, selectedTags])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setResults([])
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [])

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
        ref={inputRef}
        type="text"
        placeholder="Search fangames..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="border px-2 py-1 rounded w-full"
        autoComplete="off"
      />
      <div className="flex gap-2 mt-2 flex-wrap">
        {Object.entries(TAG_CATEGORIES).map(([category, tags]) => (
          <div key={category} className="relative">
            <details>
              <summary className="cursor-pointer px-2 py-1 border rounded bg-gray-100">{category}</summary>
              <div className="absolute bg-white border rounded shadow p-2 z-10">
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
      {results.length > 0 && (
        <ul
          ref={dropdownRef}
          className="absolute left-0 mt-2 w-full bg-white border rounded shadow-lg z-20"
        >
          {results.map((game, i) => (
            <li key={game.slug}>
              <a
                href={`/blog/${game.slug}`}
                className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-100 ${selected === i ? 'bg-gray-100' : ''}`}
                tabIndex={-1}
              >
                {game.banner && (
                  <img
                    src={game.banner}
                    alt={game.title}
                    className="w-12 h-12 object-cover rounded"
                    loading="lazy"
                  />
                )}
                <div>
                  <div className="font-medium">{game.title}</div>
                  <p className="text-sm text-gray-600">{game.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {game.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-200 rounded px-2 py-0.5">{tag}</span>
                    ))}
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}