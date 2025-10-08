import * as z from "zod";

export interface Track {
  id: number;
  path: string;
}

export const trackSchema = z.object({
  id: z.number(),
  path: z.string(),
});
