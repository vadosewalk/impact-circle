"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Button } from "@impact/ui/components/button";
import { Input } from "@impact/ui/components/input";
import { Textarea } from "@impact/ui/components/textarea";
import { CardContent, CardFooter } from "@impact/ui/components/card";
import { FieldGroup, Field, FieldLabel } from "@impact/ui/components/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@impact/ui/components/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@impact/ui/components/tabs";
import { toast } from "@impact/ui/components/sonner";
import { AlertCircle, MapPin, HandHeart, ShieldCheck } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface CreatePostFormProps {
  categories: Category[];
}

export function CreatePostForm({ categories }: CreatePostFormProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Common State
  const [postType, setPostType] = useState("tender");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Tender-specific State
  const [urgency, setUrgency] = useState("normal");

  // Drive-specific State
  const [targetFunds, setTargetFunds] = useState("");
  const [targetVolunteers, setTargetVolunteers] = useState("");

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success("Location captured successfully!");
        },
        () => toast.error("Failed to get location. Please enable permissions."),
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (postType === "drive" && !session?.user.role?.includes("ngo")) {
      toast.error("Only verified NGOs can create drives.");
      return;
    }

    setIsSubmitting(true);

    const endpoint = postType === "tender" ? "/api/marketplace/tenders" : "/api/marketplace/drives";
    const payload = {
      title,
      description,
      categoryId,
      latitude: location?.lat,
      longitude: location?.lng,
      ...(postType === "tender" && { urgency }),
      ...(postType === "drive" && {
        targetFunds,
        targetVolunteers: targetVolunteers ? parseInt(targetVolunteers, 10) : undefined,
      }),
    };

    try {
      await api.post(endpoint, payload);
      toast.success(`'${postType === "tender" ? "Need" : "Drive"}' posted successfully!`);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `Failed to post ${postType}`;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-8">
        <Tabs value={postType} onValueChange={setPostType} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="tender" className="h-full flex gap-2 font-black uppercase tracking-wider text-xs">
              <HandHeart className="size-4" /> Post a Need
            </TabsTrigger>
            <TabsTrigger value="drive" className="h-full flex gap-2 font-black uppercase tracking-wider text-xs">
              <ShieldCheck className="size-4" /> Start a Drive
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input
              id="title"
              placeholder={
                postType === "tender"
                  ? "e.g. Need medical supplies for local clinic"
                  : "e.g. Annual Winter Blanket Drive"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: Category) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {postType === "tender" ? (
              <Field>
                <FieldLabel htmlFor="urgency">Urgency Level</FieldLabel>
                <Select value={urgency} onValueChange={(v) => setUrgency(v ?? "normal")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent (SOS)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            ) : (
              <Field>
                <FieldLabel htmlFor="targetVolunteers">Volunteers Required</FieldLabel>
                <Input
                  id="targetVolunteers"
                  type="number"
                  placeholder="e.g. 50"
                  value={targetVolunteers}
                  onChange={(e) => setTargetVolunteers(e.target.value)}
                />
              </Field>
            )}
          </div>

          <Field>
            <FieldLabel htmlFor="description">Detailed Description</FieldLabel>
            <Textarea
              id="description"
              placeholder="Provide as much detail as possible..."
              className="min-h-[150px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Field>

          {postType === "drive" && (
            <Field>
              <FieldLabel htmlFor="targetFunds">Funding Goal (INR)</FieldLabel>
              <Input
                id="targetFunds"
                type="number"
                placeholder="e.g. 50000"
                value={targetFunds}
                onChange={(e) => setTargetFunds(e.target.value)}
              />
            </Field>
          )}

          <div className="pt-4">
            <Button type="button" variant="outline" className="w-full md:w-auto" onClick={handleGetLocation}>
              <MapPin className="size-4 mr-2" />
              {location
                ? `Location Captured: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                : "Attach Current Location"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Attaching your location helps local supporters find your post faster.
            </p>
          </div>
        </FieldGroup>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button type="button" variant="ghost" onClick={() => router.push("/dashboard")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : `Post ${postType === "tender" ? "Need" : "Drive"}`}
        </Button>
      </CardFooter>
    </form>
  );
}
