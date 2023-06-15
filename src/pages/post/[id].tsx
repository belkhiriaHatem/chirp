import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const SinglePostPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex justify-center h-screen">
        <div className="flex border-b p-4">
          Post View
        </div>
      </main>
    </>
  );
};

export default SinglePostPage;