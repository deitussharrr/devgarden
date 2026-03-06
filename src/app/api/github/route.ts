import { NextRequest, NextResponse } from "next/server";
import { normalizeRepo, normalizeCommit, normalizeStats, type GitHubRepo, type GitHubCommit } from "@/lib/github";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    };

    const [userResponse, reposResponse] = await Promise.all([
      fetch("https://api.github.com/user", { headers }),
      fetch("https://api.github.com/user/repos?sort=updated&per_page=100", { headers }),
    ]);

    if (!userResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch user" }, { status: userResponse.status });
    }
    if (!reposResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch repos" }, { status: reposResponse.status });
    }

    const userData = await userResponse.json() as Record<string, unknown>;
    const reposData = await reposResponse.json() as Record<string, unknown>[];
    const repos: GitHubRepo[] = reposData.map(normalizeRepo);

    const username = userData.login as string;
    const avatarUrl = userData.avatar_url as string | undefined;

    const commits: GitHubCommit[] = [];
    const repoCommits = await Promise.all(
      repos.slice(0, 10).map(async (repo) => {
        const response = await fetch(
          `https://api.github.com/repos/${repo.fullName}/commits?per_page=50`,
          { headers }
        );
        if (response.ok) {
          const data = await response.json() as Record<string, unknown>[];
          return data.map(normalizeCommit);
        }
        return [];
      })
    );

    for (const commitList of repoCommits) {
      commits.push(...commitList);
    }

    const stats = normalizeStats(repos, commits);

    const languages = Array.from(new Set(repos.map(r => r.language).filter((l): l is string => l !== null)));

    return NextResponse.json({
      username,
      avatarUrl,
      repoCount: repos.length,
      languages,
      repos,
      commits: commits.slice(0, 100),
      stats,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch GitHub data" }, { status: 500 });
  }
}
