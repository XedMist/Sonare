import { z } from 'zod';

// User DTOs
export const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  roleID: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserCreateSchema = z.object({
  name: z.string().min(3).max(30),
  password: z.string().min(6).max(100),
});

export const UserLoginSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6).max(100),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
