"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Button } from "@impact/ui/components/button";
import { Input } from "@impact/ui/components/input";
import { Textarea } from "@impact/ui/components/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@impact/ui/components/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@impact/ui/components/select";
import { toast } from "@impact/ui/components/sonner";
import { AlertCircle, MapPin } from "lucide-react";

export default function CreateTenderPage() {
  const { data: session, isPending } = useSession();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
      return;
    }
    fetchCategories();
  }, [session, isPending]);

  const fetchCategories = async () => {
    try {
      const data: any = await api.get("/api/marketplace/categories");
      setCategories(data);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success("Location captured!");
        },
        () => {
          toast.error("Failed to get location. Please enable permissions.");
        },
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
    setIsSubmitting(true);

    try {
      await api.post("/api/marketplace/tenders", {
        title,
        description,
        categoryId,
        urgency,
        latitude: location?.lat,
        longitude: location?.lng,
      });

      toast.success("Tender posted successfully!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to post tender");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending || isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Post a Community Need</CardTitle>
          <CardDescription>
            Describe what you or your community needs. Local NGOs and donors will see this on the marketplace.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">Tender Title</FieldLabel>
                <Input
                  id="title"
                  placeholder="e.g. Need medical supplies for local clinic"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel htmlFor="category">Category</FieldLabel>
                  <Select value={categoryId} onValueChange={(val) => setCategoryId(val || "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="urgency">Urgency Level</FieldLabel>
                  <Select value={urgency} onValueChange={(val) => setUrgency(val || "normal")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent (Red Tag)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="description">Detailed Requirements</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Provide as much detail as possible to help NGOs understand your need..."
                  className="min-h-[150px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Field>

              <div className="pt-4">
                <Button type="button" variant="outline" className="w-full md:w-auto" onClick={handleGetLocation}>
                  <MapPin className="size-4 mr-2" />
                  {location ? "Location Captured" : "Attach Current Location"}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Attaching your location helps local NGOs find your request faster.
                </p>
              </div>
            </FieldGroup>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 text-blue-800">
              <AlertCircle className="size-5 shrink-0" />
              <p className="text-sm">
                Your request will be visible to all verified NGOs and users in your operation radius. Be prepared to
                provide more details if requested.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button type="button" variant="ghost" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Tender"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
