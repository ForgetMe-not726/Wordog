import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DogHome from "./DogHome";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  return <DogHome />;
}
