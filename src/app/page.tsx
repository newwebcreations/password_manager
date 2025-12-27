import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">Password Manager</h1>
      <p className="text-base text-gray-600">
        Store and retrieve your credentials securely using AES encryption and hashed passwords.
      </p>
      <div className="flex gap-4">
        <Link
          className="rounded bg-black px-4 py-2 text-white"
          href="/login"
        >
          Get Started
        </Link>
        <Link
          className="rounded border border-gray-300 px-4 py-2"
          href="/dashboard"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
