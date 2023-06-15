import type { User } from "@clerk/nextjs/dist/types/server";
export const filterUser4Client = (user: User) => {
  return {
    id: user.id, 
    username: user.username, 
    profileImageUrl: user.profileImageUrl
  }
}