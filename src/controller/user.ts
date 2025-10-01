import UserService from "../services/UserService.ts";
import { zValidator } from "@hono/zod-validator";
import { userSchema } from "../model/User.ts";
import { Hono } from "hono";

const router = new Hono();
const service = new UserService();

router.get("/", async (c) => {
  const users = await service.findAll();
  return c.json(users);
});

// El zValidator comprueba que lo que se pase en el curpo de la
// peticion es lo que se espera. El omit es para que no pasen la id
router.post(
  "/",
  zValidator("json", userSchema.omit({ id: true })),
  async (c) => {
    const body = c.req.valid("json");
    const created = await service.create(body);

    return c.json(created, 201);
  },
);

router.get("/:id", async (c) => {
  const { id } = c.req.param();
  const user = await service.findById(Number(id));
  
  if (user) {
    return c.json(user);
  } else {
    return c.json({ message: "User not found" }, 404);
  }
});


router.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const user = await service.delete(Number(id));

  if (user) {
    return c.json({ message: "User deleted" });
  } else {
    return c.json({ message: "User not found" }, 404);
  }
});

export default router;
