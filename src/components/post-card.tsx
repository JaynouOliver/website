import Pic from "@/components/pic";
import type { Post } from "@/data/posts";
import { fmtDate } from "@/lib/md";
import Link from "next/link";

// Photo card for a blog post: used on the homepage, /blog and "Keep reading".
export default function PostCard({ post, lead = false }: { post: Post; lead?: boolean }) {
  return (
    <Link href={"/blog/" + post.slug} className={"pf-postcard" + (lead ? " pf-postcard-lead" : "")}>
      <span className="pf-postcard-img">
        {post.image ? (
          <Pic
            src={post.image}
            width={lead ? 1200 : 640}
            height={lead ? 630 : 400}
            priority={lead}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : null}
      </span>
      <span className="pf-postcard-body">
        <span className="pf-postcard-date">{fmtDate(post.date)}</span>
        <span className="pf-postcard-title">{post.title}</span>
        <span className="pf-postcard-sum">{post.summary}</span>
      </span>
    </Link>
  );
}
