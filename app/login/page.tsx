import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <form
        action={async (formData) => {
          "use server";
          await signIn("credentials", { email: formData.get("email"), redirectTo: "/" });
        }}
        className="space-y-3 rounded border bg-white p-6"
      >
        <h1 className="text-xl font-semibold">Login</h1>
        <input className="rounded border p-2" name="email" type="email" placeholder="demo@infrakalk.no" required />
        <button className="w-full rounded bg-blue-700 px-3 py-2 text-white" type="submit">Continue</button>
      </form>
    </main>
  );
}
