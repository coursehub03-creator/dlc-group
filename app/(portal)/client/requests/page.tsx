import { redirect } from "next/navigation";

export default function ClientRequestsLegacyPage() {
  redirect("/client/dashboard/requests");
}
