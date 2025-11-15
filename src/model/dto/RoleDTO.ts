import { z } from 'zod';
import { Capability } from '../entity/index.ts';

// Role and Permission DTOs
export const CapabilitySchema = z.enum([
  Capability.READ,
  Capability.CREATE,
  Capability.DELETE,
  Capability.UPDATE,
]);

export const PermissionResponseSchema = z.object({
  id: z.string(),
  capability: CapabilitySchema,
  resource: z.string(),
  rolesID: z.array(z.string()),
});

export const RoleResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  permissionsID: z.array(z.string()),
});

export const RoleWithPermissionsResponseSchema = RoleResponseSchema.extend({
  permissions: z.array(PermissionResponseSchema),
});

export type PermissionResponse = z.infer<typeof PermissionResponseSchema>;
export type RoleResponse = z.infer<typeof RoleResponseSchema>;
export type RoleWithPermissionsResponse = z.infer<typeof RoleWithPermissionsResponseSchema>;
