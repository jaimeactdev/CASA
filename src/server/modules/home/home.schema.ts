import { z } from 'zod';

/** GET /api/dashboard takes no query parameters. */
export const homeQuerySchema = z.object({}).strict();
