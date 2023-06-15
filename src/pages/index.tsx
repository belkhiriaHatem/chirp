import { type NextPage } from "next";
import { api } from "~/utils/api";
import { SignIn, SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postView";

const CreatePostWizard = () => {
  const user = useUser();
  const [input, setInput] = useState("");
  
  const ctx = api.useContext();
  
  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.post.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors?.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    }
  });
  
  if (!user) return null;
  return (
    <div className="flex gap-4 w-full">
      {user.user?.profileImageUrl && (<Image src={user.user?.profileImageUrl} alt="Profile Pic" className="w-14 h-14 rounded-full" width={56} height={56}/>)}
      <input disabled={isPosting} placeholder="Type some emojis..." className="bg-transparent grow outline-none" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (input !== "") {
            mutate({ content: input })
          }
        }
      }} />
      {input !== "" && (<button disabled={isPosting} onClick={() => mutate({ content: input })}>{isPosting ? <LoadingSpinner /> :"Post"}</button>)}
    </div>
  )
}

const Feed = () => {
  const { data, isFetching: postsLoading } = api.post.getAll.useQuery();

  if (postsLoading) return <LoadingPage />; 

  return (
    <div>
      {data?.map(({post, author}) => (
        <PostView author={author} post={post} key={post.id}/>
      ))}
    </div>
  )
}

const Home: NextPage = () => {

  const { isLoaded: userLoaded, isSignedIn } = useUser();
  
  if (!userLoaded) return <div />

  return (
    <>
      <PageLayout>
        <div className="flex border-b p-4">
          {!isSignedIn && <SignInButton />}
          {/* {user.isSignedIn && <><SignOutButton/><CreatePostWizard/></>} */}
          {isSignedIn && <CreatePostWizard/>}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
