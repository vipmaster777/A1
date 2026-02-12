#!/usr/bin/env python3
"""Moscow tender parser for event-tech tenders."""
from __future__ import annotations

import argparse
import csv
import json
import logging
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Iterable

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://zakupki.gov.ru/epz/order/extendedsearch/results.html"
DEFAULT_REGION = "Москва"

EVENT_KEYWORDS = [
    "мероприятие",
    "конференция",
    "форум",
    "конгресс",
    "выставка",
    "деловое мероприятие",
    "корпоративное мероприятие",
    "торжественное мероприятие",
    "официальное мероприятие",
    "презентация",
    "саммит",
    "церемония",
    "конгрессно-выставочный",
]

TECH_KEYWORDS = {
    "sound": [
        "звуковое оборудование",
        "звукоусиление",
        "система звукоусиления",
        "микрофоны",
        "радиомикрофоны",
        "пульт микшерный",
        "акустические системы",
        "озвучивание мероприятия",
    ],
    "light": [
        "световое оборудование",
        "сценический свет",
        "архитектурная подсветка",
        "световое оформление",
        "прожекторы",
        "приборы освещения",
        "светотехническое оборудование",
    ],
    "video": [
        "видеооборудование",
        "видеосистема",
        "видеосопровождение",
        "видеосъемка мероприятия",
        "видеотрансляция",
        "мультимедийное оборудование",
        "led экран",
        "светодиодный экран",
        "видеостена",
        "плазменные панели",
        "проекционное оборудование",
        "проекторы",
    ],
    "streaming": [
        "онлайн трансляция",
        "видеотрансляция мероприятия",
        "стриминг",
        "трансляция в интернет",
        "гибридное мероприятие",
        "техническое сопровождение трансляции",
    ],
    "translation": [
        "синхронный перевод",
        "оборудование синхронного перевода",
        "кабины переводчиков",
        "системы инфракрасного перевода",
        "радиосистемы перевода",
        "техническое обеспечение перевода",
    ],
    "registration": [
        "регистрация участников",
        "электронная регистрация",
        "система регистрации",
        "бейджи участников",
        "аккредитация участников",
        "стойка регистрации",
        "контроль доступа мероприятия",
    ],
}

MAIN_OKPD2 = {
    "90.02.19.000",
    "93.29.29.000",
    "82.30.11.000",
    "82.30.12.000",
    "59.11.20.000",
    "59.12.20.000",
}

SECONDARY_OKPD2 = {
    "43.21.10.110",
    "43.21.10.120",
    "26.40.33.190",
    "26.70.16.000",
    "32.99.53.110",
}

EXCLUDED_PHRASES = [
    "разработка по",
    "лицензия",
    "система электронного документооборота",
    "сопровождение информационных систем",
    "техническая поддержка ит",
]

DATE_FORMATS = ["%d.%m.%Y %H:%M", "%d.%m.%Y"]


@dataclass
class Tender:
    tender_id: str
    title: str
    description: str
    customer: str
    price: str
    currency: str
    deadline_at: str
    published_at: str
    region: str
    url: str
    okpd2: list[str] = field(default_factory=list)
    keywords_hit: dict[str, list[str]] = field(default_factory=dict)
    relevance_score: int = 0


@dataclass
class KeywordsHit:
    matched_event_keywords: list[str]
    matched_tech_keywords: list[str]
    matched_tech_groups: set[str]
    matched_okpd2: list[str]


class TenderParser:
    def __init__(self, *, region: str, pages: int, records_per_page: int) -> None:
        self.region = region
        self.pages = pages
        self.records_per_page = records_per_page
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": (
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
                )
            }
        )

    def fetch_search_page(self, page: int) -> str:
        params = {
            "searchString": "мероприятие",
            "fz44": "on",
            "fz223": "on",
            "af": "on",
            "sortDirection": "false",
            "recordsPerPage": f"_{self.records_per_page}",
            "pageNumber": str(page),
        }
        response = self.session.get(BASE_URL, params=params, timeout=30)
        response.raise_for_status()
        return response.text

    def parse_search_results(self, html: str) -> list[dict[str, str]]:
        soup = BeautifulSoup(html, "lxml")
        entries = []
        for item in soup.select("div.search-registry-entry-block"):
            title_el = item.select_one("div.registry-entry__body-value")
            title = title_el.get_text(" ", strip=True) if title_el else ""
            link_el = item.select_one("a.registry-entry__header-mid__number")
            url = link_el["href"] if link_el and link_el.has_attr("href") else ""
            if url and url.startswith("/"):
                url = f"https://zakupki.gov.ru{url}"
            tender_id = link_el.get_text(strip=True) if link_el else ""
            entries.append(
                {
                    "tender_id": tender_id,
                    "title": title,
                    "url": url,
                    "snippet": item.get_text(" ", strip=True),
                }
            )
        return entries

    def fetch_tender_details(self, url: str) -> str:
        response = self.session.get(url, timeout=30)
        response.raise_for_status()
        return response.text

    def parse_details(self, html: str, fallback: dict[str, str]) -> Tender:
        soup = BeautifulSoup(html, "lxml")
        title = self._find_value_by_label(soup, "Наименование объекта закупки") or fallback.get("title", "")
        description = self._find_value_by_label(soup, "Объект закупки")
        customer = self._find_value_by_label(soup, "Организация, осуществляющая закупку")
        price = self._find_value_by_label(soup, "Начальная (максимальная) цена")
        currency = "RUB"
        deadline_at = self._find_value_by_label(soup, "Окончание подачи заявок")
        published_at = self._find_value_by_label(soup, "Размещено")
        region = self._find_value_by_label(soup, "Регион") or self._find_region_from_text(soup.get_text(" ", strip=True))
        okpd2 = self._extract_okpd2(soup.get_text(" ", strip=True))
        return Tender(
            tender_id=fallback.get("tender_id", ""),
            title=title,
            description=description,
            customer=customer,
            price=price,
            currency=currency,
            deadline_at=self._normalize_date(deadline_at),
            published_at=self._normalize_date(published_at),
            region=region,
            url=fallback.get("url", ""),
            okpd2=sorted(okpd2),
        )

    def _find_value_by_label(self, soup: BeautifulSoup, label: str) -> str:
        for row in soup.select("div.common-info-block__col"):  # common info blocks
            label_el = row.select_one("div.common-info-block__title")
            value_el = row.select_one("div.common-info-block__value")
            if not label_el or not value_el:
                continue
            if label_el.get_text(strip=True) == label:
                return value_el.get_text(" ", strip=True)
        return ""

    def _extract_okpd2(self, text: str) -> set[str]:
        codes = set()
        for code in MAIN_OKPD2 | SECONDARY_OKPD2:
            if code in text:
                codes.add(code)
        return codes

    def _find_region_from_text(self, text: str) -> str:
        if "москва" in normalize_text(text):
            return "Москва"
        return ""

    def _normalize_date(self, value: str) -> str:
        value = value.strip()
        for fmt in DATE_FORMATS:
            try:
                parsed = datetime.strptime(value, fmt)
                return parsed.isoformat()
            except ValueError:
                continue
        return value


def normalize_text(text: str) -> str:
    return text.lower().replace("ё", "е")


def match_keywords(text: str, keywords: Iterable[str]) -> list[str]:
    text_norm = normalize_text(text)
    hits = []
    for keyword in keywords:
        if normalize_text(keyword) in text_norm:
            hits.append(keyword)
    return sorted(set(hits))


def match_tech_keywords(text: str) -> tuple[list[str], set[str]]:
    matched = []
    groups = set()
    for group, keywords in TECH_KEYWORDS.items():
        hits = match_keywords(text, keywords)
        if hits:
            groups.add(group)
            matched.extend(hits)
    return sorted(set(matched)), groups


def has_excluded_only(text: str, event_hits: list[str]) -> bool:
    if event_hits:
        return False
    text_norm = normalize_text(text)
    return any(phrase in text_norm for phrase in EXCLUDED_PHRASES)


def calculate_relevance(event_hits: list[str], tech_groups: set[str], main_okpd2: list[str]) -> int:
    score = 0
    if event_hits:
        score += 30
    score += 20 * len(tech_groups)
    if main_okpd2:
        score += 40
    return min(score, 100)


def filter_relevant(tender: Tender) -> tuple[bool, KeywordsHit]:
    full_text = " ".join(
        [tender.title, tender.description, tender.customer, " ".join(tender.okpd2)]
    )
    event_hits = match_keywords(full_text, EVENT_KEYWORDS)
    tech_hits, tech_groups = match_tech_keywords(full_text)
    matched_okpd2 = [code for code in tender.okpd2 if code in MAIN_OKPD2 or code in SECONDARY_OKPD2]
    if has_excluded_only(full_text, event_hits):
        return False, KeywordsHit(event_hits, tech_hits, tech_groups, matched_okpd2)
    relevant = bool(event_hits and tech_hits) or any(code in MAIN_OKPD2 for code in tender.okpd2)
    return relevant, KeywordsHit(event_hits, tech_hits, tech_groups, matched_okpd2)


def is_active(deadline_at: str) -> bool:
    if not deadline_at:
        return False
    try:
        deadline = datetime.fromisoformat(deadline_at)
    except ValueError:
        return False
    return deadline >= datetime.now()


def sort_tenders(tenders: list[Tender]) -> list[Tender]:
    def sort_key(item: Tender) -> tuple:
        deadline = item.deadline_at or "9999-12-31T00:00:00"
        return (deadline, -item.relevance_score)

    return sorted(tenders, key=sort_key)


def export_json(tenders: list[Tender], path: Path) -> None:
    payload = [asdict(tender) for tender in tenders]
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def export_csv(tenders: list[Tender], path: Path) -> None:
    if not tenders:
        path.write_text("", encoding="utf-8")
        return
    fieldnames = list(asdict(tenders[0]).keys())
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for tender in tenders:
            writer.writerow(asdict(tender))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Parse active Moscow event-tech tenders.")
    parser.add_argument("--region", default=DEFAULT_REGION, help="Region filter (default: Москва)")
    parser.add_argument("--pages", type=int, default=3, help="Number of search pages to parse")
    parser.add_argument("--records-per-page", type=int, default=50, help="Records per page")
    parser.add_argument("--output-dir", type=Path, default=Path("output"), help="Output directory")
    parser.add_argument("--log-level", default="INFO", help="Logging level")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    logging.basicConfig(level=getattr(logging, args.log_level.upper(), logging.INFO))

    parser_service = TenderParser(
        region=args.region,
        pages=args.pages,
        records_per_page=args.records_per_page,
    )

    tenders: list[Tender] = []

    for page in range(1, args.pages + 1):
        logging.info("Fetching page %s", page)
        html = parser_service.fetch_search_page(page)
        entries = parser_service.parse_search_results(html)
        logging.info("Found %s entries on page %s", len(entries), page)
        for entry in entries:
            if not entry.get("url"):
                continue
            try:
                detail_html = parser_service.fetch_tender_details(entry["url"])
            except requests.RequestException as exc:
                logging.warning("Failed to fetch %s: %s", entry["url"], exc)
                continue
            tender = parser_service.parse_details(detail_html, entry)
            if args.region and args.region.lower() not in normalize_text(tender.region):
                continue
            relevant, keywords_hit = filter_relevant(tender)
            tender.keywords_hit = {
                "matched_event_keywords": keywords_hit.matched_event_keywords,
                "matched_tech_keywords": keywords_hit.matched_tech_keywords,
                "matched_okpd2": keywords_hit.matched_okpd2,
            }
            tender.relevance_score = calculate_relevance(
                keywords_hit.matched_event_keywords,
                keywords_hit.matched_tech_groups,
                [code for code in tender.okpd2 if code in MAIN_OKPD2],
            )
            if not relevant:
                continue
            if not is_active(tender.deadline_at):
                continue
            tenders.append(tender)

    tenders = sort_tenders(tenders)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    json_path = args.output_dir / "moscow_event_tech_tenders.json"
    csv_path = args.output_dir / "moscow_event_tech_tenders.csv"
    export_json(tenders, json_path)
    export_csv(tenders, csv_path)
    logging.info("Saved %s tenders to %s and %s", len(tenders), json_path, csv_path)


if __name__ == "__main__":
    main()
