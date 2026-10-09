import { z } from 'zod';

const categoryBody = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(40),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a hex value like #4f46e5')
    .optional(),
};

export const createCategorySchema = z.object(categoryBody);
export const updateCategorySchema = z
  .object(categoryBody)
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'Provide at least one field to update');
