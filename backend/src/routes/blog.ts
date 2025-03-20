import {
  createBlogInput,
  updateBlogInput,
} from "@kumartanmay554/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { decode, verify } from "hono/jwt";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  if(c.req.method === "GET"){
    await next();
    return;
  }
  try {
    // getting header and verifying token
    const authHeader = c.req.header("jwt") || "";
    const user = await verify(authHeader, c.env.JWT_SECRET);
    if (user) {
      // @ts-ignore
      c.set("userId", user.id);
      await next();
    } else {
      c.status(403);
      return c.json({ error: "unauthorized" });
    }
  } catch (e) {
    c.status(403);
    return c.json({ error: "unauthorized" });
  }
});

// user posting a blog
blogRouter.post("/", async (c) => {
  const authorId = c.get("userId");

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const author = await prisma.user.findFirst({
      where: {
        id: authorId,
      },
    });
    const body = await c.req.json();
    const { success } = createBlogInput.safeParse(body);
    if (!success) {
      c.status(411);
      return c.json({
        message: "Invalid format to create a blog post",
      });
    }
    let post;
    try {
      post = await prisma.post.create({
        data: {
          title: body.title,
          content: body.content,
          authorId: authorId,
          // image: body?.image || "",
          authorName: author?.name || author?.email,
          published:true,
        },
      });
    } catch (error) {
      console.error(error);
      c.status(500);
      return c.json({
        message: "Error while creating post",
      });
    }
    console.log("next step");
    c.status(200);
    return c.json({
      id: post.id,
    });
  } catch (error) {
    return c.status(403);
  }
});

blogRouter.put("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const body = await c.req.json();
    const { success } = updateBlogInput.safeParse(body);
    if (!success) {
      c.status(411);
      return c.json({
        message: "Invalid inputs to update the blog post",
      });
    }

    const post = await prisma.post.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });
    c.status(200);
    return c.json({
      message: "post successfully updated",
      id: post.id,
    });
  } catch (error) {
    c.status(403);
    return c.json({
      message: "Error while updating post",
    });
  }
});

// pagination
blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const posts = await prisma.post.findMany({
      // select:{
      //     content:true,
      //     title:true,
      //     id:true,
      //     author:{
      //         select:{
      //             name:true,

      //         }
      //     }
      // }
      orderBy: {
        createdAt: "desc",
      },
    });
    c.status(200);
    return c.json({
      posts,
    });
  } catch (error) {
    c.status(403);
    return c.json({
      message: "Error while fetching posts",
    });
  }
});
blogRouter.get('/:id', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const id = c.req.param("id");
    const post = await prisma.post.findFirst({
      where: {
        id,
      },
      // select:{
      //     id:true,
      //     content:true,
      //     title:true,
      //     author:{
      //         select:{
      //             name:true,
      //         }
      //     }
      // }
    });
    c.status(200);
    return c.json({
      post,
    });
  } catch (e) {
    c.status(411);
    return c.json({
      message: "Error while fetching post",
    });
  }
});
