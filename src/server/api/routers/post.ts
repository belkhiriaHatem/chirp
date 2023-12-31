import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import { filterUser4Client } from "~/server/helpers/filterUser4Client";
import type { Post } from "@prisma/client";

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

const addUserData2Posts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUser4Client);

  return posts.map((post) => ({
    post,
    author: users.find((user) => user.id === post.authorId)
  }));
}

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{createdAt: "desc"}]
    });

    return addUserData2Posts(posts);
  }),

  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const post = await ctx.prisma.post.findUnique({
      where: {
        id: input.id
      }
    })

    if (!post) throw new TRPCError({ code: "NOT_FOUND" });

    return (await addUserData2Posts([post]))[0];
  }),

  getPostsByUserId: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => 
    await ctx.prisma.post.findMany({
      where: {
        authorId: input.userId
      },
      take: 100,
      orderBy: [{ createdAt: 'desc' }]
    }).then(addUserData2Posts)
  ),

  create: privateProcedure.input(z.object({
    content: z.string().emoji("Only emoji are allowed").min(1).max(280)
  })).mutation(async ({ ctx, input }) => {
    const authorId = ctx.userId;

    const { success } = await ratelimit.limit(authorId);
    if (!success) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
    }

    const post = await ctx.prisma.post.create({
      data: {
        authorId,
        content: input.content,
      }
    });

    return post;

  })
});
