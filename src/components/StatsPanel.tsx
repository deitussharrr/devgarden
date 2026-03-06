"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import type { NormalizedStats } from "@/lib/github";
import { useGarden } from "@/components/GardenContext";
import { generateGarden, type GardenSeed } from "@/lib/garden";

interface GitHubData {
  username: string;
  repoCount: number;
  languages: string[];
  stats: NormalizedStats;
}

async function fetchGitHubData(token: string): Promise<GitHubData | null> {
  try {
    const res = await fetch(`/api/github?token=${token}`);
    const data = await res.json();
    if (data.error) return null;
    return {
      username: data.username,
      repoCount: data.repoCount,
      languages: data.languages,
      stats: data.stats,
    };
  } catch {
    return null;
  }
}

export default function StatsPanel() {
  const { data: session, status } = useSession();
  const { setGardenData, setIsLoading } = useGarden();
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    const token = session?.accessToken;
    if (!token || fetched || loading) return;

    let cancelled = false;
    
    const doFetch = async () => {
      setLoading(true);
      setIsLoading(true);
      
      const githubData = await fetchGitHubData(token);
      
      if (cancelled) return;
      
      if (githubData) {
        setData(githubData);
        
        const plantCount = Math.min(githubData.repoCount * 5, 200);
        
        const gardenSeed: GardenSeed = {
          username: githubData.username,
          repoCount: githubData.repoCount,
          languages: githubData.languages,
          plantCount,
        };
        
        const plants = generateGarden(gardenSeed);
        setGardenData(gardenSeed, plants);
      }
      
      setLoading(false);
      setIsLoading(false);
      setFetched(true);
    };

    doFetch();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, fetched, loading, setGardenData, setIsLoading]);

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
        <div className="text-zinc-400 text-lg">Sign in with GitHub to view your garden</div>
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

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-zinc-400">Generating your garden...</div>
        </div>
      )}

      {data && (
        <>
          <div className="p-4 bg-indigo-900/30 border border-indigo-800 rounded-lg">
            <div className="text-2xl font-bold text-white">@{data.username}</div>
            <div className="text-zinc-400">{data.repoCount} repositories → {Math.min(data.repoCount * 5, 200)} plants</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Repositories" value={data.stats.totalRepos} />
            <StatCard label="Stars" value={data.stats.totalStars} />
            <StatCard label="Forks" value={data.stats.totalForks} />
          </div>

          {data.languages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {data.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm rounded-full"
                  >
                    {lang}
                  </span>
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
