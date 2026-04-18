import { redirect } from "next/navigation";

export default function ClientDocumentsLegacyPage() {
  redirect("/client/dashboard/requests");
}
