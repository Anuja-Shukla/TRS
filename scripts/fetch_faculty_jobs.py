"""
Fetches latest faculty job postings from facultyplus.com and writes them to
_data/faculty_jobs.json for the site to render.

Targets <h1>/<h3> heading tags containing a link to a facultyplus.com post
(the site runs the tagDiv "Newspaper" WordPress theme, which wraps each
post title in a heading tag), and filters out navigation/category/archive
links using an exclude-pattern list, since those are more stable across
theme updates than guessing exact CSS classes.
"""

import json
import re
import sys
from datetime import datetime, timezone

import requests
from bs4 import BeautifulSoup

SOURCE_URL = "https://www.facultyplus.com/"
OUTPUT_PATH = "data/faculty_jobs.json"
MAX_JOBS = 20

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    )
}

EXCLUDE_PATTERNS = [
    r"/category/", r"/tag/", r"/page/", r"/about-us", r"/privacy-policy",
    r"/disclaimer", r"/contact-us", r"/college-recruiters-zone", r"/login",
    r"/subscribe", r"/faq", r"^\d{4}/\d{2}/\d{2}/?$", r"^\d{4}/\d{2}/?$",
    r"/wp-content/", r"/feed", r"^$",
]


def is_job_link(href):
    if not href or "facultyplus.com" not in href:
        return False
    path = href.split("facultyplus.com", 1)[-1].strip("/")
    for pattern in EXCLUDE_PATTERNS:
        if re.search(pattern, path):
            return False
    # Job post slugs are reasonably long and hyphenated; short paths are
    # almost always structural (e.g. category roots).
    if len(path) < 15 or "-" not in path:
        return False
    return True


def extract_jobs(html):
    soup = BeautifulSoup(html, "html.parser")
    jobs = []
    seen_urls = set()

    for heading in soup.find_all(["h1", "h3"]):
        link = heading.find("a", href=True)
        if not link:
            continue
        href = link["href"]
        if not is_job_link(href):
            continue
        if href in seen_urls:
            continue

        title = link.get_text(strip=True)
        if not title or len(title) < 8:
            continue

        jobs.append({
            "title": title,
            "date": "",
            "url": href,
        })
        seen_urls.add(href)

        if len(jobs) >= MAX_JOBS:
            break

    return jobs


def main():
    try:
        response = requests.get(SOURCE_URL, headers=HEADERS, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Failed to fetch source page: {e}", file=sys.stderr)
        sys.exit(1)

    jobs = extract_jobs(response.text)

    if not jobs:
        print("No jobs extracted — site structure may have changed. Keeping previous data.", file=sys.stderr)
        sys.exit(1)

    output = {
        "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "source": SOURCE_URL,
        "jobs": jobs,
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Wrote {len(jobs)} jobs to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
