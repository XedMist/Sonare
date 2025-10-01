import * as z from "zod";

// La interfaz del tipo Album
export interface Album {
  id: number;
  name: string;
  artistIds: number[];
  trackIds: number[];
}

// El esquema para validar el cuerpo de los POST
export const albumSchema = z.object({
  id: z.number(),
  name: z.string(),
  artistIds: z.array(z.number()).default([]),
  trackIds: z.array(z.number()).default([]),
});
