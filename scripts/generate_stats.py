#!/usr/bin/env python3
"""Generate self-hosted overview, languages, and delivery-metrics SVGs."""

from __future__ import annotations

import json
import os
import pathlib
import urllib.error
import urllib.request
from collections import Counter
from datetime import datetime, timezone

TOKEN = os.environ.get("ACCESS_TOKEN") or os.environ.get("GITHUB_TOKEN")
USERNAME = os.environ.get("GITHUB_ACTOR") or os.environ.get("GITHUB_REPOSITORY_OWNER") or "aftab-ahmad-khan-dev"
OUT_DIR = pathlib.Path("generated")
# Optional override; otherwise computed from recent commit stats
AVG_LOC_OVERRIDE = os.environ.get("AVG_LOC")

ORGS = [
    "E-volvo",
    "Evolvo-Technologies",
    "Synaptrix-Solution-Dev",
    "Synaptrix-Solution",
    "NPM-Packages-Modules",
]

LANG_COLORS = {
    "TypeScript": "#3178C6",
    "JavaScript": "#F1E05A",
    "Python": "#3572A5",
    "HTML": "#E34C26",
    "CSS": "#563D7C",
    "Shell": "#89E051",
    "Dart": "#00B4AB",
    "Java": "#B07219",
    "Go": "#00ADD8",
    "Rust": "#DEA584",
    "Ruby": "#701516",
    "PHP": "#4F5D95",
    "C": "#555555",
    "C++": "#F34B7D",
    "Swift": "#F05138",
    "Kotlin": "#A97BFF",
    "Vue": "#41B883",
    "SCSS": "#C6538C",
}


def require_token() -> None:
    if not TOKEN:
        raise SystemExit("ACCESS_TOKEN or GITHUB_TOKEN is required")


def api(url: str) -> dict | list:
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "self-hosted-stats",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode())


def gql(query: str) -> dict:
    data = json.dumps({"query": query}).encode()
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=data,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "self-hosted-stats",
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as res:
        payload = json.loads(res.read().decode())
    if payload.get("errors"):
        raise RuntimeError(payload["errors"])
    return payload


def escape(text: str) -> str:
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def fmt(n: int | float) -> str:
    if isinstance(n, float):
        return f"{n:,.1f}" if n < 100 else f"{n:,.0f}"
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 10_000:
        return f"{n / 1_000:.1f}k"
    return f"{n:,}"


def count_org_repos(org: str) -> int:
    total = 0
    page = 1
    while True:
        try:
            batch = api(
                f"https://api.github.com/orgs/{org}/repos?per_page=100&type=all&page={page}"
            )
        except urllib.error.HTTPError:
            return total
        if not isinstance(batch, list) or not batch:
            break
        total += len(batch)
        if len(batch) < 100:
            break
        page += 1
    return total


def personal_repo_count() -> int:
    """Count owned repos for USERNAME (works with GITHUB_TOKEN or user PAT)."""
    q = f"""
    query {{
      user(login: "{USERNAME}") {{
        repositories(ownerAffiliations: OWNER) {{ totalCount }}
      }}
    }}
    """
    try:
        return int(gql(q)["data"]["user"]["repositories"]["totalCount"])
    except Exception:
        total = 0
        page = 1
        while True:
            batch = api(
                f"https://api.github.com/users/{USERNAME}/repos?per_page=100&type=owner&page={page}"
            )
            if not isinstance(batch, list) or not batch:
                break
            total += len(batch)
            if len(batch) < 100:
                break
            page += 1
        return total


def estimate_avg_loc() -> int:
    """
    Typical LOC added per commit = 10–90% trimmed mean of recent commits.
    Raw mean is skewed by scaffold/import dumps; median alone understates
    normal feature work. Trimmed mean is the fairest 'average'.
    """
    if AVG_LOC_OVERRIDE:
        return int(AVG_LOC_OVERRIDE)

    additions: list[int] = []
    try:
        repos: list[str] = []
        for page in (1, 2):
            try:
                batch = api(
                    f"https://api.github.com/user/repos?per_page=30&affiliation=owner&sort=pushed&page={page}"
                )
            except urllib.error.HTTPError:
                batch = api(
                    f"https://api.github.com/users/{USERNAME}/repos?per_page=30&type=owner&sort=pushed&page={page}"
                )
            if not isinstance(batch, list) or not batch:
                break
            for repo in batch:
                if repo.get("fork"):
                    continue
                name = repo.get("name")
                owner = repo.get("owner", {}).get("login", USERNAME)
                if owner != USERNAME or not name:
                    continue
                repos.append(f"{USERNAME}/{name}")
            if len(batch) < 30:
                break

        for full in repos[:20]:
            try:
                commits = api(
                    f"https://api.github.com/repos/{full}/commits?per_page=10&author={USERNAME}"
                )
            except urllib.error.HTTPError:
                continue
            if not isinstance(commits, list):
                continue
            for commit in commits[:8]:
                try:
                    detail = api(f"https://api.github.com/repos/{full}/commits/{commit['sha']}")
                except urllib.error.HTTPError:
                    continue
                stats = detail.get("stats") or {}
                added = int(stats.get("additions") or 0)
                deleted = int(stats.get("deletions") or 0)
                # Skip empty + bulk dumps (lockfiles, generated assets, big imports)
                if added + deleted == 0 or added + deleted > 2000:
                    continue
                additions.append(added)
                if len(additions) >= 120:
                    break
            if len(additions) >= 120:
                break
    except Exception as exc:
        print(f"avg LOC sampling failed ({exc}); using fallback 155")
        return 155

    if len(additions) < 5:
        return 155

    additions.sort()
    n = len(additions)
    lo, hi = int(n * 0.10), max(int(n * 0.10) + 1, int(n * 0.90))
    trimmed = additions[lo:hi]
    mean = sum(trimmed) / len(trimmed)
    # Round to nearest 5 for stable display
    return max(20, int(round(mean / 5.0) * 5))


def fetch_overview() -> dict:
    q = f"""
    query {{
      user(login: "{USERNAME}") {{
        name
        repositories(ownerAffiliations: OWNER, isFork: false) {{ totalCount }}
        repositoriesContributedTo(contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY], first: 1) {{ totalCount }}
        contributionsCollection {{
          totalCommitContributions
          restrictedContributionsCount
          totalPullRequestContributions
          totalIssueContributions
          totalPullRequestReviewContributions
        }}
        starredRepositories {{ totalCount }}
      }}
    }}
    """
    user = gql(q)["data"]["user"]
    c = user["contributionsCollection"]
    commits = int(c["totalCommitContributions"]) + int(c["restrictedContributionsCount"])

    # Stars across owned repos (sample up to 100)
    stars = 0
    page = 1
    while page <= 3:
        batch = api(
            f"https://api.github.com/users/{USERNAME}/repos?per_page=100&type=owner&page={page}"
        )
        if not isinstance(batch, list) or not batch:
            break
        stars += sum(int(r.get("stargazers_count", 0)) for r in batch)
        if len(batch) < 100:
            break
        page += 1

    return {
        "name": user.get("name") or USERNAME,
        "commits": commits,
        "prs": int(c["totalPullRequestContributions"]),
        "issues": int(c["totalIssueContributions"]),
        "reviews": int(c["totalPullRequestReviewContributions"]),
        "contributed": int(user["repositoriesContributedTo"]["totalCount"]),
        "repos": int(user["repositories"]["totalCount"]),
        "stars": stars,
    }


def fetch_languages(limit: int = 8) -> list[tuple[str, int]]:
    counts: Counter[str] = Counter()
    page = 1
    while page <= 5:
        batch = api(
            f"https://api.github.com/users/{USERNAME}/repos?per_page=100&type=owner&page={page}"
        )
        if not isinstance(batch, list) or not batch:
            break
        for repo in batch:
            if repo.get("fork"):
                continue
            name = repo["name"]
            try:
                langs = api(
                    f"https://api.github.com/repos/{USERNAME}/{name}/languages"
                )
            except urllib.error.HTTPError:
                continue
            if isinstance(langs, dict):
                for lang, bytes_count in langs.items():
                    counts[lang] += int(bytes_count)
        if len(batch) < 100:
            break
        page += 1
    return counts.most_common(limit)


def render_overview(stats: dict) -> str:
    rows = [
        ("Total Stars Earned", stats["stars"]),
        ("Commits (last 12 months)", stats["commits"]),
        ("Pull Requests", stats["prs"]),
        ("Issues Opened", stats["issues"]),
        ("Repos Contributed To", stats["contributed"]),
    ]
    lines = []
    y = 78
    for label, value in rows:
        lines.append(
            f'<text x="36" y="{y}" class="label">{escape(label)}</text>'
            f'<text x="520" y="{y}" class="val" text-anchor="end">{escape(fmt(value))}</text>'
        )
        y += 34
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="560" height="270" viewBox="0 0 560 270" role="img">
  <style>
    .title {{ fill:#10B981; font:700 20px Segoe UI,Ubuntu,sans-serif }}
    .sub {{ fill:#6B7280; font:500 12px Segoe UI,Ubuntu,sans-serif }}
    .label {{ fill:#9CA3AF; font:600 15px Segoe UI,Ubuntu,sans-serif }}
    .val {{ fill:#F3F4F6; font:700 16px Segoe UI,Ubuntu,sans-serif }}
  </style>
  <rect width="560" height="270" rx="12" fill="#0D1117"/>
  <rect x="0" y="0" width="4" height="270" fill="#10B981"/>
  <text x="36" y="40" class="title">{escape(stats["name"])}</text>
  <text x="36" y="58" class="sub">GitHub activity snapshot</text>
  {''.join(lines)}
</svg>
'''


def render_languages(langs: list[tuple[str, int]]) -> str:
    # Drop noise languages under 0.15%
    total_all = sum(v for _, v in langs) or 1
    langs = [(n, v) for n, v in langs if (v / total_all) * 100 >= 0.15][:7]
    total = sum(v for _, v in langs) or 1
    bars = []
    y = 78
    for name, value in langs:
        pct = value / total * 100
        width = max(12, int(pct / 100 * 480))
        color = LANG_COLORS.get(name, "#10B981")
        bars.append(
            f'<text x="36" y="{y}" class="label">{escape(name)}</text>'
            f'<text x="520" y="{y}" class="val" text-anchor="end">{pct:.1f}%</text>'
            f'<rect x="36" y="{y + 8}" width="480" height="10" rx="5" fill="#21262D"/>'
            f'<rect x="36" y="{y + 8}" width="{width}" height="10" rx="5" fill="{color}"/>'
        )
        y += 42
    height = max(240, y + 24)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="560" height="{height}" viewBox="0 0 560 {height}" role="img">
  <style>
    .title {{ fill:#10B981; font:700 20px Segoe UI,Ubuntu,sans-serif }}
    .sub {{ fill:#6B7280; font:500 12px Segoe UI,Ubuntu,sans-serif }}
    .label {{ fill:#E5E7EB; font:600 14px Segoe UI,Ubuntu,sans-serif }}
    .val {{ fill:#9CA3AF; font:600 14px Segoe UI,Ubuntu,sans-serif }}
  </style>
  <rect width="560" height="{height}" rx="12" fill="#0D1117"/>
  <rect x="0" y="0" width="4" height="{height}" fill="#10B981"/>
  <text x="36" y="40" class="title">Most Used Languages</text>
  <text x="36" y="58" class="sub">Across owned repositories</text>
  {''.join(bars)}
</svg>
'''


def render_metrics(
    personal: int,
    org_counts: dict[str, int],
    total: int,
    avg_day: float,
    avg_loc: int,
    commits_year: int,
) -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    org_lines = []
    y = 148
    for name, count in org_counts.items():
        org_lines.append(
            f'<text x="40" y="{y}" class="muted">{escape(name)}</text>'
            f'<text x="520" y="{y}" class="val" text-anchor="end">{count}</text>'
        )
        y += 22
    divider_y = y + 10
    kpi_y = divider_y + 32
    height = kpi_y + 44
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="560" height="{height}" viewBox="0 0 560 {height}" role="img">
  <style>
    .title {{ fill:#10B981; font:700 16px Segoe UI,Ubuntu,sans-serif }}
    .label {{ fill:#9CA3AF; font:600 13px Segoe UI,Ubuntu,sans-serif }}
    .val {{ fill:#E5E7EB; font:700 13px Segoe UI,Ubuntu,sans-serif }}
    .big {{ fill:#F9FAFB; font:800 28px Segoe UI,Ubuntu,sans-serif }}
    .muted {{ fill:#6B7280; font:500 12px Segoe UI,Ubuntu,sans-serif }}
    .accent {{ fill:#34D399; font:700 13px Segoe UI,Ubuntu,sans-serif }}
  </style>
  <rect width="560" height="{height}" rx="12" fill="#0D1117"/>
  <rect x="0" y="0" width="4" height="{height}" fill="#10B981"/>
  <text x="24" y="36" class="title">DELIVERY METRICS · refreshed {now}</text>
  <text x="40" y="72" class="label">Total repositories</text>
  <text x="40" y="100" class="big">{total}+</text>
  <text x="200" y="72" class="label">Personal</text>
  <text x="200" y="100" class="big">{personal}</text>
  <text x="360" y="72" class="label">Organizations</text>
  <text x="360" y="100" class="big">{len(org_counts)}</text>
  <text x="40" y="128" class="accent">Org repo breakdown</text>
  {''.join(org_lines)}
  <rect x="24" y="{divider_y}" width="512" height="1" fill="#1F2937"/>
  <text x="40" y="{kpi_y}" class="label">Avg commits / day</text>
  <text x="40" y="{kpi_y + 26}" class="big">{avg_day}</text>
  <text x="200" y="{kpi_y}" class="label">Avg LOC / commit</text>
  <text x="200" y="{kpi_y + 26}" class="big">~{avg_loc}</text>
  <text x="360" y="{kpi_y}" class="label">Commits (12 mo)</text>
  <text x="360" y="{kpi_y + 26}" class="big">{commits_year:,}</text>
</svg>
'''


def main() -> None:
    require_token()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    overview = fetch_overview()
    langs = fetch_languages()
    personal = personal_repo_count()
    org_counts = {org: count_org_repos(org) for org in ORGS}
    org_counts = {k: v for k, v in org_counts.items() if v > 0}
    org_total = sum(org_counts.values())
    total = personal + org_total
    commits_year = overview["commits"]
    avg_day = round(commits_year / 365, 1)
    avg_loc = estimate_avg_loc()

    (OUT_DIR / "overview.svg").write_text(render_overview(overview), encoding="utf-8")
    (OUT_DIR / "languages.svg").write_text(render_languages(langs), encoding="utf-8")
    (OUT_DIR / "metrics.svg").write_text(
        render_metrics(personal, org_counts, total, avg_day, avg_loc, commits_year),
        encoding="utf-8",
    )
    print(
        f"Wrote overview/languages/metrics · personal={personal} orgs={org_total} "
        f"total={total} commits={commits_year} avg/day={avg_day} avgLOC={avg_loc} langs={len(langs)}"
    )


if __name__ == "__main__":
    main()
