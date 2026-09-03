import { redirect } from "next/navigation";

import { halls } from "@/lib/halls-data";

export default function PrivateIndexPage() {
  redirect(`/${halls[0].id}`);
}
