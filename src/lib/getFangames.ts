import { getCollection } from 'astro:content'

export async function getFangames() {
  const allPosts = await getCollection('blog')
  return allPosts.map(post => {
    // Assume post.id is like '2023-post' and banner is at `/src/content/blog/2023-post/banner.png`
    const banner = `/src/content/blog/${post.id}/banner.png`
    return {
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags || [],
      slug: post.id,
      banner,
    }
  })
}