import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    //change the url with the website domain name
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://almah.shop'

  return {
    rules: [
        {
            userAgent: '*',
            allow: '/',
            disallow:[
                '/admin',
                '/admin/*',
                '/api/*',
            ],
        },
    ],
     sitemap: `${baseUrl}/sitemap.xml`,
  }
}