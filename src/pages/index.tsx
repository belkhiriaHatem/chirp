import { type NextPage } from "next";
import Link from "next/link";
import { RouterOutputs, api } from "~/utils/api";
import { SignIn, SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import dayjs from "dayjs";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import relativeTime from 'dayjs/plugin/relativeTime';
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/layout";

dayjs.extend(relativeTime);

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

type PostWithUser = RouterOutputs["post"]["getAll"][number]

const PostView = (props: PostWithUser) => {
  return (
    <div key={props.post.id} className="flex border-b p-4">
      <div className="flex gap-4 w-full items-center">
        {props.author?.profileImageUrl && (<Image src={props.author?.profileImageUrl} alt="Author Pic" className="w-14 h-14 rounded-full" width={56} height={56}/>)}
        <div className="flex flex-col">
          <div>
            <Link href={`/@${String(props.author?.username)}`}><span className="font-thin text-slate-400 cursor-pointer">{`@${String(props.author?.username)}`}</span></Link>
            <Link href={`/post/${String(props.post.id)}`}><span className="text-slate-200 text-sm">{` · ${String(dayjs(props.post.createdAt).fromNow())}`}</span></Link>
          </div>
          <span>{props.post.content}</span>
        </div>
      </div>
    </div>
  )
}

const Feed = () => {
  const { data, isFetching: postsLoading } = api.post.getAll.useQuery();

  if (postsLoading) return <LoadingPage />; 

  return (
    <div>
      {data?.map(({post, author}) => (
        <PostView  author={author} post={post} key={post.id}/>
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
