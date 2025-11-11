import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Overview",
};

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound();
  }

  const [user, posts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
    }),
    prisma.post.findMany({
      where: { authorId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) {
    notFound();
  }

  const publishedCount = posts.filter((post) => post.published).length;
  const draftCount = posts.length - publishedCount;
  const displayName = user.name ?? "there";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Hello, {displayName}</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your content right now.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{posts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-emerald-600">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-amber-500">{draftCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Member since</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {new Intl.DateTimeFormat("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(user.createdAt)}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Latest posts</h2>
          <p className="text-sm text-muted-foreground">
            Track the status of your recent publications and drafts.
          </p>
        </div>
        <Card>
          <CardContent className="divide-y divide-border/60 p-0">
            {posts.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No posts yet.{" "}
                <a
                  href="/dashboard/posts/new"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Create your first post.
                </a>
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="px-6 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(post.createdAt)}
                      </p>
                    </div>
                    <span
                      className={
                        post.published
                          ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
                          : "rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
                      }
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <Separator className="my-3" />
                  <p className="text-sm text-muted-foreground">{post.content}</p>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

