import * as z from "zod";

// La definición de los géneros musicales
export type Genre =
  | "Rock"
  | "Pop"
  | "Jazz"
  | "Classical"
  | "Hip-Hop"
  | "Electronic"
  | "Country"
  | "Reggae"
  | "Blues"
  | "Folk"
  | "Metal"
  | "Punk"
  | "R&B"
  | "Soul"
  | "Funk"
  | "Disco"
  | "Gospel"
  | "Ska"
  | "Techno"
  | "House";

// La interfaz del tipo Track
export interface Track {
  id: number;
  name: string;
  duration: number;
  path: string;
  albumId?: number;
  genres: Genre[];
}

// El esquema para validar el cuerpo de los POST
export const trackSchema = z.object({
  id: z.number(),
  name: z.string(),
  duration: z.number().positive(),
  path: z.string(),
  albumId: z.number().optional(),
  genres: z.array(
    z.enum([
      "Rock",
      "Pop",
      "Jazz",
      "Classical",
      "Hip-Hop",
      "Electronic",
      "Country",
      "Reggae",
      "Blues",
      "Folk",
      "Metal",
      "Punk",
      "R&B",
      "Soul",
      "Funk",
      "Disco",
      "Gospel",
      "Ska",
      "Techno",
      "House",
    ]),
  ).default([]),
});
