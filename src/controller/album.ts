import AlbumService from "../services/AlbumService.ts";
import { Hono } from "hono";

const router = new Hono();
const service = new AlbumService();

router.get("/", async (c) => {
  const name = c.req.query("name");
  const artist = c.req.query("artist");
  if (name) {
    const albums = await service.getAlbums({
      id: 0,
      name,
      artistIds: [],
      trackIds: [],
    });
    return c.json(albums);
  } else if (artist) {
    const albums = await service.getAlbumsFromArtist(Number(artist));
    return c.json(albums);
  } else {
    return c.json({
      message: "You must provide a name or artist query parameter",
    }, 400);
  }
});

export default router;
