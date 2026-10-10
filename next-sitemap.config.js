/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4200',
  generateRobotsTxt: true,
  exclude: ['/login', '/home', '/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/login', '/home', '/api/'],
      },
    ],
  },
};
