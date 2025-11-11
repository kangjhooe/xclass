import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { PostForm } from "@/components/forms/post-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Create Post",
};

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Create a new post</h1>
        <p className="text-sm text-muted-foreground">
          Share your latest update with the community. You can publish immediately or save as draft.
        </p>
      </div>
      <Card className="border-border/70 shadow-lg shadow-black/5">
        <CardHeader>
          <CardTitle>Post details</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm />
        </CardContent>
      </Card>
    </section>
  );
}

