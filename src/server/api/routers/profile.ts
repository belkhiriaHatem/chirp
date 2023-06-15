import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import { filterUser4Client } from "~/server/helpers/filterUser4Client";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure.input(z.object({username: z.string()})).query(async ({ ctx, input }) => {
    const [user] = await clerkClient.users.getUserList({ 
        username: [input.username],
    });

    if (!user) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User not found!",
        })
    }

    return filterUser4Client(user);
  })
});
