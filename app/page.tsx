import { redirect } from "next/navigation";

export default function RootPage() {
  // The dashboard shell bounces unauthenticated visitors to /login.
  redirect("/dashboard");
}
