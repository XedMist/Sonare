import * as z from "zod";

export interface User {
  id: number;
  name: string;
}

export const userCreateSchema = z.object({
  name: z.string().min(1),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
});

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
