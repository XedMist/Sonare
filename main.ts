import { Hono , Context} from "hono";

const app = new Hono();

app.get("/:id", (c: Context) => {
  let id = c.req.param("id") ?? "unknown";
  return c.text(`Holiwis Hono! ${id}`);
});

Deno.serve(app.fetch);


