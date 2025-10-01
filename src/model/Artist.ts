import * as z from "zod";

// La interfaz del tipo User
export interface Artist {
  id: number;
  name: string;
}

// El esquema para validar el cuerpo de los POST
export const artistSchema = z.object({
  id: z.number(),
  name: z.string(),
});
