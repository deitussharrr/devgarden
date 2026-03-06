export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  htmlUrl: string;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  watchersCount: number;
  size: number;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  authorEmail: string | null;
  date: string;
  additions: number;
  deletions: number;
}

export interface NormalizedStats {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  languages: Record<string, number>;
  commitsByMonth: Record<string, number>;
  topRepos: { name: string; stars: number; commits: number }[];
}

export function normalizeRepo(repo: Record<string, unknown>): GitHubRepo {
  return {
    id: repo.id as number,
    name: repo.name as string,
    fullName: repo.full_name as string,
    description: repo.description as string | null,
    private: repo.private as boolean,
    htmlUrl: repo.html_url as string,
    language: repo.language as string | null,
    stargazersCount: repo.stargazers_count as number,
    forksCount: repo.forks_count as number,
    openIssuesCount: repo.open_issues_count as number,
    watchersCount: repo.watchers_count as number,
    size: repo.size as number,
    defaultBranch: repo.default_branch as string,
    createdAt: repo.created_at as string,
    updatedAt: repo.updated_at as string,
    pushedAt: repo.pushed_at as string,
  };
}

export function normalizeCommit(commit: Record<string, unknown>): GitHubCommit {
  const commitData = commit.commit as Record<string, unknown>;
  const authorData = commitData.author as Record<string, unknown> | null;
  const stats = commit.stats as Record<string, unknown> | undefined;

  return {
    sha: commit.sha as string,
    message: commitData.message as string,
    author: authorData?.name as string ?? "Unknown",
    authorEmail: authorData?.email as string | null,
    date: authorData?.date as string ?? "",
    additions: (stats?.additions as number) ?? 0,
    deletions: (stats?.deletions as number) ?? 0,
  };
}

export function normalizeStats(
  repos: GitHubRepo[],
  commits: GitHubCommit[]
): NormalizedStats {
  const languages: Record<string, number> = {};
  const commitsByMonth: Record<string, number> = {};
  let totalStars = 0;
  let totalForks = 0;
  let totalCommits = 0;
  let totalAdditions = 0;
  let totalDeletions = 0;

  for (const repo of repos) {
    totalStars += repo.stargazersCount;
    totalForks += repo.forksCount;
    
    if (repo.language && repo.language in languages) {
      languages[repo.language]++;
    } else if (repo.language) {
      languages[repo.language] = 1;
    }
  }

  const repoCommitCounts: Record<string, { stars: number; commits: number }> = {};

  for (const commit of commits) {
    totalCommits++;
    totalAdditions += commit.additions;
    totalDeletions += commit.deletions;

    const date = new Date(commit.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    commitsByMonth[monthKey] = (commitsByMonth[monthKey] ?? 0) + 1;

    const repoName = commit.message.includes('Merge') 
      ? 'merged' 
      : commit.sha.substring(0, 7);
    
    if (!(repoName in repoCommitCounts)) {
      const repo = repos.find(r => r.name === repoName);
      repoCommitCounts[repoName] = { 
        stars: repo?.stargazersCount ?? 0, 
        commits: 0 
      };
    }
    repoCommitCounts[repoName].commits++;
  }

  const topRepos = Object.entries(repoCommitCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 5);

  return {
    totalRepos: repos.length,
    totalStars,
    totalForks,
    totalCommits,
    totalAdditions,
    totalDeletions,
    languages,
    commitsByMonth,
    topRepos,
  };
}
