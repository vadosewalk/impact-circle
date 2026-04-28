import { redirect } from "next/navigation";

export default function TendersIndexPage() {
  // Currently no generic tenders directory page exists, 
  // users should access individual drives via /tenders/[id]
  redirect("/dashboard");
}
