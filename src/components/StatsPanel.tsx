"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import type { NormalizedStats } from "@/lib/github";

async function fetchGitHubData(token: string): Promise<NormalizedStats | null> {
  try {
    const res = await fetch(`/api/github?token=${token}`);
    const data = await res.json();
    return data.stats ?? null;
  } catch {
    return null;
  }
}

export default function StatsPanel() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<NormalizedStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const handleFetchData = async () => {
    if (!session?.accessToken || fetched) return;
    
    setLoading(true);
    const data = await fetchGitHubData(session.accessToken);
    setStats(data);
    setLoading(false);
    setFetched(true);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-zinc-400 text-lg">Sign in with GitHub to view your stats</div>
        <button
          onClick={() => signIn("github")}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "User"}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div>
            <div className="font-semibold text-white">{session.user?.name}</div>
            <div className="text-sm text-zinc-400">@{session.user?.email}</div>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>

      {!fetched && !loading && (
        <button
          onClick={handleFetchData}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
        >
          Load GitHub Stats
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-zinc-400">Fetching GitHub data...</div>
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Repositories" value={stats.totalRepos} />
            <StatCard label="Stars" value={stats.totalStars} />
            <StatCard label="Forks" value={stats.totalForks} />
            <StatCard label="Commits" value={stats.totalCommits} />
            <StatCard label="Additions" value={stats.totalAdditions} />
            <StatCard label="Deletions" value={stats.totalDeletions} />
          </div>

          {Object.keys(stats.languages).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.languages)
                  .sort(([, a], [, b]) => b - a)
                  .map(([lang, count]) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm rounded-full"
                    >
                      {lang} ({count})
                    </span>
                  ))}
              </div>
            </div>
          )}

          {stats.topRepos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Top Repositories</h3>
              <div className="space-y-2">
                {stats.topRepos.map((repo) => (
                  <div
                    key={repo.name}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                  >
                    <span className="text-zinc-300">{repo.name}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-yellow-400">★ {repo.stars}</span>
                      <span className="text-zinc-400">⌘ {repo.commits}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 bg-zinc-800/50 rounded-lg">
      <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
      <div className="text-sm text-zinc-400">{label}</div>
    </div>
  );
}
