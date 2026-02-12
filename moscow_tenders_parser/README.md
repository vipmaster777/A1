# moscow_tenders_parser

Production-ready parser for **active** event-tech tenders in **Moscow**.

## What it does
- Fetches tenders from zakupki.gov.ru search results.
- Extracts tender details and **filters only relevant EVENT-TECH** cases.
- Applies relevance rules and scoring.
- Exports **JSON** and **CSV** sorted by:
  1) `deadline_at` (closest first)
  2) `relevance_score` (descending)

## Requirements
- Python 3.10+

Install dependencies:
```bash
pip install -r requirements.txt
```

## Quick start
```bash
python moscow_tenders_parser.py --pages 3 --records-per-page 50 --output-dir output
```

### Parameters
- `--region` — region filter (default: `Москва`).
- `--pages` — number of pages to parse.
- `--records-per-page` — page size used in search.
- `--output-dir` — folder for JSON/CSV outputs.
- `--log-level` — logging verbosity.

## Output
The script generates:
- `output/moscow_event_tech_tenders.json`
- `output/moscow_event_tech_tenders.csv`

## Relevance logic
A tender is **relevant** if:
- It contains **at least one EVENT keyword** AND **at least one technical keyword**, **OR**
- It contains **any main OKPD2** code.

It is **excluded** if it only contains IT support / software phrases without event keywords.

### Scoring (`relevance_score`)
- +30 for any EVENT keyword
- +20 for each matched technical group
- +40 for any main OKPD2
- Score is capped at 100

## Example output (3 tenders)
See `examples/sample_output.json` and `examples/sample_output.csv`.

## Notes
- The script uses public tender data from zakupki.gov.ru.
- Network limitations or access restrictions on the data source may affect parsing.
