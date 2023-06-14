import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUser4Client = (user: User) => {
  return {
    id: user.id, 
    username: user.username, 
    profileImageUrl: user.profileImageUrl
  }
}

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{createdAt: "desc"}]
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUser4Client);

    // console.log(users);

    return posts.map((post) => ({
      post,
      author: users.find((user) => user.id === post.authorId)
    }))

    // return posts;
    
  }),

  create: privateProcedure.input(z.object({
    content: z.string().emoji().min(1).max(280)
  })).mutation(async ({ ctx, input }) => {

    const authorId = ctx.userId;

    const post = await ctx.prisma.post.create({
      data: {
        authorId,
        content: input.content,
      }
    });

    return post;

  })
});
