import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
});
