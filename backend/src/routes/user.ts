import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import {signupInput, signinInput} from '@kumartanmay554/medium-common'
import { checkPassword, hashPassword } from "../password/passwordHashing";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();

userRouter.get("/check",async(c)=>{
  const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const jwt = c.req.header("jwt") || "";
    const user = await verify(jwt,c.env.JWT_SECRET);
    if(user){
      c.status(200);
      return c.json({user});
    }
  } catch (error) {
    c.status(403);
    return c.json({error:"unauthorized"});
  }
})

userRouter.post('/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const {success} = signupInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({
      message: "Invalid input"
    })
  }
  // finding existing user
  try {
    const mailExists = await prisma.user.findUnique({
      where:{
        email:body.email,
      }
    })
    if(mailExists){
      c.status(403);
      return c.json({
        message: "Email already exists"
      })
    }
    // creating new user
    const pass = await hashPassword(body.password);
    const user = await prisma.user.create({
      data:{
        email:body.email,
        password:pass,
        name:body.name,
      },
    })
    const jwt = await sign({id:user.id},c.env.JWT_SECRET);
    return c.json({
      jwt
    })
  } catch (error) {
    return c.status(403);
  }
})
  
userRouter.post('/signin', async (c) => {
  const prisma = new PrismaClient({
    //@ts-ignore
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const {success} = signinInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({
        message: "Invalid input",
      })
    }
    try {
      const user = await prisma.user.findUnique({
        where: {
            email: body.email,
        },
    });

    if (!user) {
        c.status(403);
        return c.json({ error: "Email Not linked" });
    }

    const check = await checkPassword(body.password,user.password);
    if(!check){
      c.status(403);
      return c.json({
        message: "Invalid password"
      });
    }
    const {password, ...userData} = user;
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt, user: userData });
    } catch (error) {
      c.status(403);
    }    
})

userRouter.get("/getUser/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const authorid = c.req.param("id");
  try{
    const user = await prisma.user.findFirst({
      where:{
        id:authorid,
      },
    })
    if(!user){
      c.status(411);
      return c.json({
        message:"User not found"
      })
    }
    c.status(200);
    return c.json({name:user.name,email:user.email});
  }catch(error){
    c.status(403);
    return c.json({
      message:"Error while fetching user"
    })
  }
});
