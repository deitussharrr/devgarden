"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { NormalizedStats } from "@/lib/github";
import { useGarden } from "@/components/GardenContext";
import {
  buildGardenClusters,
  generateGarden,
  getLanguageGardenStyle,
  type GardenRepo,
  type GardenSeed,
} from "@/lib/garden";

interface GitHubData {
  username: string;
  avatarUrl?: string;
  repoCount: number;
  languages: string[];
  repos: GardenRepo[];
  stats: NormalizedStats;
}

async function fetchGitHubData(token: string): Promise<GitHubData | null> {
  try {
    const res = await fetch(`/api/github?token=${token}`);
    const data = await res.json();
    if (data.error) return null;
    return {
      username: data.username,
      avatarUrl: data.avatarUrl,
      repoCount: data.repoCount,
      languages: data.languages,
      repos: data.repos,
      stats: data.stats,
    };
  } catch {
    return null;
  }
}

export default function StatsPanel() {
  const { data: session, status } = useSession();
  const { setGardenData, setIsLoading, selectedRepoName, setSelectedRepoName } = useGarden();
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    const token = session?.accessToken;
    if (!token || fetchedRef.current) return;

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
          repos: githubData.repos,
        };

        const plants = generateGarden(gardenSeed);
        const clusters = buildGardenClusters(plants);
        setGardenData(gardenSeed, plants, clusters, githubData.repos);
      }

      setLoading(false);
      setIsLoading(false);
      fetchedRef.current = true;
    };

    doFetch();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

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
          {(data?.avatarUrl || session.user?.image) && (
            <Image
              src={data?.avatarUrl ?? session.user?.image ?? ""}
              alt={session.user?.name ?? data?.username ?? "User"}
              width={40}
              height={40}
              className="rounded-full border border-zinc-700"
            />
          )}
          <div>
            <div className="font-semibold text-white">{session.user?.name ?? data?.username}</div>
            <div className="text-sm text-zinc-400">@{data?.username ?? session.user?.email}</div>
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
            <div className="text-zinc-400">
              {data.repoCount} repositories -&gt; {Math.min(data.repoCount * 5, 200)} plants
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Repositories" value={data.stats.totalRepos} />
            <StatCard label="Stars" value={data.stats.totalStars} />
            <StatCard label="Forks" value={data.stats.totalForks} />
          </div>

          {data.languages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Language Legend</h3>
              <div className="space-y-2">
                {data.languages.map((lang) => {
                  const style = getLanguageGardenStyle(lang);
                  return (
                    <div
                      key={lang}
                      className="flex items-center justify-between gap-2 px-3 py-2 bg-zinc-800/70 text-zinc-200 text-sm rounded-lg border border-zinc-700"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="inline-block w-3 h-3 rounded-full border border-zinc-500"
                          style={{ backgroundColor: style.color }}
                        />
                        <span className="truncate">{lang}</span>
                      </div>
                      <span className="text-xs text-zinc-400 uppercase tracking-wide">{style.type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {data.repos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Repositories</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {data.repos.map((repo) => (
                  <button
                    key={repo.name}
                    onClick={() => setSelectedRepoName(repo.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                      selectedRepoName === repo.name
                        ? "bg-emerald-700/30 border-emerald-500 text-emerald-100"
                        : "bg-zinc-800/50 border-zinc-700 text-zinc-200 hover:bg-zinc-700/60"
                    }`}
                  >
                    <div className="font-medium truncate">{repo.name}</div>
                    <div className="text-xs text-zinc-400 truncate">{repo.language ?? "Unknown language"}</div>
                  </button>
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
