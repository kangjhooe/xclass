"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { postSchema, type PostInput } from "@/lib/validators";

type PostFormValues = z.input<typeof postSchema>;

export function PostForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      published: false,
    },
  });

  const onSubmit = (values: PostFormValues) => {
    startTransition(async () => {
      const payload: PostInput = postSchema.parse(values);

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message =
          data?.message ?? Object.values(data?.errors ?? {}).flat().join(", ") ?? "Could not create post.";
        toast.error(message);
        return;
      }

      form.reset({
        title: "",
        content: "",
        published: false,
      });
      toast.success("Post created successfully.");
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. How to build a production-ready dashboard" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write something insightful..."
                  rows={8}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Markdown is supported.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border p-4 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Publish immediately</FormLabel>
                <FormDescription>
                  When enabled, the post will appear in your public feed instantly.
                </FormDescription>
              </div>
                <FormControl>
                  <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create post"
          )}
        </Button>
      </form>
    </Form>
  );
}

