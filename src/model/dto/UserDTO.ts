import { z } from 'zod';

// User DTOs
export const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  birthdate: z.date().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  roleID: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserCreateSchema = z.object({
  name: z.string().trim().min(3).max(30),
  password: z.string().min(6).max(100),
  displayName: z.string().trim().min(1).max(60),
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  bio: z.string().trim().max(280).optional(),
  country: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
  birthdate: z.coerce.date().optional(),
});

export const UserLoginSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6).max(100),
});

export const UserProfileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(60).optional(),
  firstName: z.string().trim().min(1).max(60).optional(),
  lastName: z.string().trim().min(1).max(60).optional(),
  bio: z.string().trim().max(280).optional(),
  country: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
  birthdate: z.coerce.date().optional(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;
