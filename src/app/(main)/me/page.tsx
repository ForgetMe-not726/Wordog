import { auth } from "@/lib/auth";
import { signOut } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-green-50 p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Profile</h1>

      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        {session?.user ? (
          <>
            <p className="text-gray-700 font-medium">{session.user.name ?? "User"}</p>
            <p className="text-gray-400 text-sm">{session.user.email}</p>
          </>
        ) : (
          <p className="text-gray-400">Not logged in</p>
        )}
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/auth/login" });
        }}
      >
        <button type="submit" className="w-full bg-red-100 text-red-500 rounded-xl py-3 font-bold hover:bg-red-200 transition-colors">
          Log Out
        </button>
      </form>
    </div>
  );
}
