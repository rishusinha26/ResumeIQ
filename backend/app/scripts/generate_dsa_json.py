import csv
import json
from pathlib import Path
from urllib.parse import urlparse

COMPANY_MAP = {
    'amazon': 'Amazon',
    'airbus': 'Airbus',
    'cisco': 'Cisco',
    'dream 11': 'Dream 11',
    'flipkart': 'Flipkart',
    'godaddy': 'GoDaddy',
    'goldman sach': 'Goldman Sachs',
    'google': 'Google',
    'hsbc': 'HSBC',
    'hotstar': 'Hotstar',
    'intel': 'Intel',
    'jp morgan': 'JPMorgan',
    'lenskart': 'Lenskart',
    'linkedln': 'LinkedIn',
    'microsoft': 'Microsoft',
    'meta': 'Meta',
    'morgan stanley': 'Morgan Stanley',
    'netfilx': 'Netflix',
    'nike': 'Nike',
}

CSV_PATHS = [
    Path(r'C:\Users\rishu\Downloads\amazon.csv'),
    Path(r'C:\Users\rishu\Downloads\airbus.csv'),
    Path(r'C:\Users\rishu\Downloads\cisco.csv'),
    Path(r'C:\Users\rishu\Downloads\dream 11.csv'),
    Path(r'C:\Users\rishu\Downloads\flipkart.csv'),
    Path(r'C:\Users\rishu\Downloads\godaddy.csv'),
    Path(r'C:\Users\rishu\Downloads\goldman sach.csv'),
    Path(r'C:\Users\rishu\Downloads\google.csv'),
    Path(r'C:\Users\rishu\Downloads\hsbc.csv'),
    Path(r'C:\Users\rishu\Downloads\hotstar.csv'),
    Path(r'C:\Users\rishu\Downloads\intel.csv'),
    Path(r'C:\Users\rishu\Downloads\jp morgan.csv'),
    Path(r'C:\Users\rishu\Downloads\lenskart.csv'),
    Path(r'C:\Users\rishu\Downloads\linkedln.csv'),
    Path(r'C:\Users\rishu\Downloads\microsoft.csv'),
    Path(r'C:\Users\rishu\Downloads\meta.csv'),
    Path(r'C:\Users\rishu\Downloads\morgan stanley.csv'),
    Path(r'C:\Users\rishu\Downloads\netfilx.csv'),
    Path(r'C:\Users\rishu\Downloads\nike.csv'),
]

OUTPUT_PATH = Path(__file__).resolve().parent.parent / 'data' / 'dsa_questions.json'


def normalize_topic(topics: str) -> str:
    if not topics:
        return 'general'

    for token in [t.strip().lower() for t in topics.split(',') if t.strip()]:
        if 'array' in token:
            return 'arrays'
        if 'string' in token and 'substring' not in token:
            return 'strings'
        if 'graph' in token:
            return 'graphs'
        if 'tree' in token:
            return 'trees'
        if 'dynamic programming' in token or token == 'dp':
            return 'dp'
        if 'design' in token:
            return 'design'
        if 'greedy' in token:
            return 'greedy'
        if 'heap' in token or 'priority queue' in token:
            return 'heap'
        if 'sort' in token or 'sorting' in token:
            return 'sorting'
        if 'matrix' in token:
            return 'matrix'
        if 'linked list' in token:
            return 'linked-list'
        if 'binary search' in token:
            return 'binary-search'
        if 'two pointers' in token or 'two-pointers' in token:
            return 'two-pointers'

    return topics.split(',')[0].strip().lower().replace(' ', '-')


def build_company_name(path: Path) -> str:
    return COMPANY_MAP.get(path.stem.lower(), path.stem.title())


def build_tags(topics: str, topic: str) -> list[str]:
    tags = [t.strip().lower() for t in topics.split(',') if t.strip()]
    if topic not in tags:
        tags.insert(0, topic)
    if 'leetcode' not in tags:
        tags.append('leetcode')
    if 'company' not in tags:
        tags.append('company')
    return [tag.replace(' ', '-').lower() for tag in tags]


def parse_csv(path: Path) -> list[dict]:
    if not path.exists():
        raise FileNotFoundError(path)

    company = build_company_name(path)
    questions = []
    with path.open(newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            title = row.get('Title', '').strip()
            if not title:
                continue

            difficulty = row.get('Difficulty', '').strip().lower()
            if difficulty not in {'easy', 'medium', 'hard'}:
                difficulty = 'easy'

            link = row.get('Link', '').strip()
            if not link:
                continue

            slug = Path(urlparse(link).path).name
            if slug == 'problems' or not slug:
                continue

            topics = row.get('Topics', '').strip()
            topic = normalize_topic(topics)
            tags = build_tags(topics, topic)
            description = f'Practice {title} as a LeetCode problem commonly asked by {company}.'

            questions.append({
                'company': company,
                'title': title,
                'difficulty': difficulty,
                'topic': topic,
                'tags': tags,
                'description': description,
                'leetcode_slug': slug,
                'leetcode_url': link,
            })

    return questions


def main() -> None:
    all_questions = []
    seen = set()
    for path in CSV_PATHS:
        for question in parse_csv(path):
            key = (question['company'], question['title'], question['leetcode_slug'])
            if key in seen:
                continue
            seen.add(key)
            all_questions.append(question)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open('w', encoding='utf-8') as outfile:
        json.dump(all_questions, outfile, indent=2)

    print(f'Wrote {OUTPUT_PATH} with {len(all_questions)} questions')


if __name__ == '__main__':
    main()
