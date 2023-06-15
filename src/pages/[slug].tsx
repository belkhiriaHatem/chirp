import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postView";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSSGHelper();

  const slug = context.params?.slug as string;
  if (typeof slug !== "string") throw new Error('No slug!')
  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username
    },
  };
}

export const getStaticPaths = () => {
  return {
    paths: [], fallback: "blocking"
  }
}

const ProfileFeed = (props: {userId: string}) => {
  const { data, isFetching } = api.post.getPostsByUserId.useQuery({ userId: props.userId });

  if (isFetching) return <LoadingPage />
  if (!data) return <div>User have no Posts yet!</div>
  
  return (
    <div className="flex flex-col">
      {data.map((post, i) => (
        <PostView post={post.post} author={post.author} key={i}/>
      ))}
    </div>
  )
}

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>@{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 border-slate-400 bg-slate-800">
          <Image 
            src={data.profileImageUrl} 
            alt="proPic"
            width={128} 
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]" />
        <div className="p-4 text-xl font-bold">
          @{data.username}
        </div>
        <div className="w-full border-b border-slate-400"></div>
        {data.id && (<ProfileFeed userId={data.id} />)}
      </PageLayout>
    </>
  );
};

export default ProfilePage;
