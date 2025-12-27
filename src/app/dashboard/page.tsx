"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PasswordItem = {
  _id?: string;
  id?: string;
  title: string;
  username: string;
  url?: string;
  createdAt?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<PasswordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  const loadItems = async () => {
    setLoading(true);
    const res = await fetch("/api/passwords");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const data = (await res.json()) as { items: PasswordItem[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Failed to load passwords.");
      setLoading(false);
      return;
    }
    setItems(data.items);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const revealPassword = async (id: string) => {
    const res = await fetch(`/api/passwords/${id}`);
    if (!res.ok) {
      setError("Failed to decrypt password.");
      return;
    }
    const data = (await res.json()) as { item: { password: string } };
    setRevealed((prev) => ({ ...prev, [id]: data.item.password }));
  };

  const deletePassword = async (id: string) => {
    const res = await fetch(`/api/passwords/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Failed to delete entry.");
      return;
    }
    setItems((prev) => prev.filter((item) => (item._id ?? item.id) !== id));
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your Vault</h1>
          <p className="text-sm text-gray-600">Passwords are encrypted at rest.</p>
        </div>
        <div className="flex gap-3">
          <Link className="rounded bg-black px-4 py-2 text-white" href="/passwords/new">
            Add Password
          </Link>
          <button className="rounded border border-gray-300 px-4 py-2" onClick={logout} type="button">
            Log out
          </button>
        </div>
      </header>

      {loading ? <p>Loading...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-col gap-4">
        {items.length === 0 && !loading ? <p>No passwords saved yet.</p> : null}
        {items.map((item) => {
          const id = item._id ?? item.id ?? "";
          return (
            <div key={id} className="rounded border border-gray-200 p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="text-sm text-gray-600">{item.username}</p>
                    {item.url ? (
                      <a className="text-sm text-blue-600 underline" href={item.url} target="_blank" rel="noreferrer">
                        {item.url}
                      </a>
                    ) : null}
                  </div>
                  <button
                    className="rounded border border-gray-300 px-3 py-1 text-sm"
                    type="button"
                    onClick={() => deletePassword(id)}
                  >
                    Delete
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="rounded bg-gray-100 px-3 py-1 text-sm"
                    type="button"
                    onClick={() => revealPassword(id)}
                  >
                    Reveal
                  </button>
                  <span className="text-sm text-gray-700">
                    {revealed[id] ? revealed[id] : "••••••••"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
