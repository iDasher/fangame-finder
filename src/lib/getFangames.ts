import { getCollection } from 'astro:content'

export async function getFangames() {
  const allPosts = await getCollection('blog')
  return allPosts.map(post => {
    // Assume banner.png is in public/blog/{post.id}/banner.png
    const banner = `/blog/${post.id}/banner.png`
    return {
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags || [],
      slug: post.id,
      banner,
    }
  })
}