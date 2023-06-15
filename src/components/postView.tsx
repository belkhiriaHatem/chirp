import Link from "next/link";
import { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import Image from "next/image";
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number]

export const PostView = (props: PostWithUser) => {
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
};