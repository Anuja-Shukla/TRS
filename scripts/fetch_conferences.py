"""
Fetches upcoming conferences from conferencealerts.in and writes them to
_data/conferences.json for the site to render.

Targets links matching /eventdetail/<id> rather than specific CSS classes,
since that URL pattern is the most structurally stable part of the page.
"""

import json
import re
import sys
from datetime import datetime, timezone

import requests
from bs4 import BeautifulSoup

SOURCE_URL = "https://www.conferencealerts.in/all-upcoming-conferences"
OUTPUT_PATH = "data/conferences.json"
MAX_EVENTS = 20

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    )
}

DATE_PATTERN = re.compile(
    r"\d{1,2}\s?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s?\d{4}",
    re.IGNORECASE,
)


def extract_events(html):
    soup = BeautifulSoup(html, "html.parser")
    events = []
    seen_ids = set()

    for link in soup.find_all("a", href=True):
        href = link["href"]
        match = re.search(r"/eventdetail/(\d+)", href)
        if not match:
            continue

        event_id = match.group(1)
        if event_id in seen_ids:
            continue

        title = link.get_text(strip=True)
        if not title:
            continue

        # Walk up to a reasonably sized container to find the date/location
        # text that sits near this link in the page.
        container = link
        context_text = ""
        for _ in range(4):
            if container.parent is None:
                break
            container = container.parent
            context_text = container.get_text(" ", strip=True)
            if len(context_text) > 20:
                break

        date_match = DATE_PATTERN.search(context_text)
        date_str = date_match.group(0) if date_match else ""

        # Location: strip out the title and date from the context text,
        # what's left over is usually "City, Country Organizer".
        location_text = context_text.replace(title, "")
        if date_str:
            location_text = location_text.replace(date_str, "")
        location_text = re.sub(r"\s+", " ", location_text).strip(" -|")
        location_text = location_text[:120]

        full_url = href if href.startswith("http") else f"https://www.conferencealerts.in{href}"

        events.append({
            "id": event_id,
            "title": title,
            "date": date_str,
            "location": location_text,
            "url": full_url,
        })
        seen_ids.add(event_id)

        if len(events) >= MAX_EVENTS:
            break

    return events


def main():
    try:
        response = requests.get(SOURCE_URL, headers=HEADERS, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Failed to fetch source page: {e}", file=sys.stderr)
        sys.exit(1)

    events = extract_events(response.text)

    if not events:
        print("No events extracted — site structure may have changed. Keeping previous data.", file=sys.stderr)
        sys.exit(1)

    output = {
        "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "source": SOURCE_URL,
        "events": events,
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Wrote {len(events)} events to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
