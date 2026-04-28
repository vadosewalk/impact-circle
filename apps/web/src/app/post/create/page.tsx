import { Suspense } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@impact/ui/components/card";
import { CreatePostForm } from "@/components/post/create-post-form";

interface Category {
  id: string;
  name: string;
}

async function fetchCategories() {
  try {
    const res = (await api.get("/api/marketplace/categories")) as { data: Category[] };
    return res.data || [];
  } catch {
    return [];
  }
}

function PageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
      <Card>
        <CardHeader>
          <div className="h-10 w-2/3 bg-muted rounded-md mb-2" />
          <div className="h-4 w-full bg-muted rounded-md" />
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          <div className="h-10 w-full bg-muted rounded-md" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-10 w-full bg-muted rounded-md" />
            <div className="h-10 w-full bg-muted rounded-md" />
          </div>
          <div className="h-36 w-full bg-muted rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}

async function CreatePostContent() {
  const categories = await fetchCategories();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-black tracking-tighter">Create a Post</CardTitle>
          <CardDescription>Share a community need (Tender) or announce a new NGO initiative (Drive).</CardDescription>
        </CardHeader>
        <CreatePostForm categories={categories} />
      </Card>
    </div>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CreatePostContent />
    </Suspense>
  );
}
