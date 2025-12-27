"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewPasswordPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [url, setUrl] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/passwords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, username, url, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Failed to save password.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Add Password</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm">
          Title
          <input
            className="rounded border border-gray-300 px-3 py-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Username
          <input
            className="rounded border border-gray-300 px-3 py-2"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          URL
          <input
            className="rounded border border-gray-300 px-3 py-2"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Password
          <input
            className="rounded border border-gray-300 px-3 py-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="rounded bg-black px-4 py-2 text-white" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Password"}
        </button>
      </form>
    </main>
  );
}
