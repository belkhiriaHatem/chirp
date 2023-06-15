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

  const id = context.params?.id as string;
  if (typeof id !== "string") throw new Error('No id!')

  await helpers.post.getById.prefetch({ id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id
    },
  };
}

export const getStaticPaths = () => {
  return {
    paths: [], fallback: "blocking"
  }
}

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data, isFetching } = api.post.getById.useQuery({ id });

  if (isFetching) return <LoadingPage />;
  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.post.content} - @{data.author?.username}</title>
      </Head>
      <PageLayout>
        <PostView author={data.author} post={data.post} />
      </PageLayout>
    </>
  );
};

export default SinglePostPage;