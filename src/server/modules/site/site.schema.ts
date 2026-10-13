import { z } from 'zod';

/** GET /api/public/site takes no query parameters. */
export const siteQuerySchema = z.object({}).strict();
