import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  // If user is logged in, redirect to their dashboard based on role
  if (session?.user) {
    switch (session.user.role) {
      case "ADMIN":
        redirect("/admin");
      case "TEACHER":
        redirect("/teacher");
      case "STUDENT":
        redirect("/student");
      default:
        redirect("/login");
    }
  }

  // If not logged in, redirect to login page
  redirect("/login");
}
