import { redirect } from "next/navigation";

export default function ClientSettingsLegacyPage() {
  redirect("/client/dashboard/settings");
}
