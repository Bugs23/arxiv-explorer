# Design Decisions — Locked

## Concept

- Filterable, sortable table of arXiv papers
- Default sort: created date descending (newest first)

## Filters (all live, no search button)

- Subject: `<select>` with `<optgroup>` by prefix (`cs.*`, `astro-ph.*`, etc.)
- Affiliation: text input, substring match, case-insensitive
- Date: From / To date inputs, both optional, empty = no constraint

## Data handling

- Fetch from `/data/papers.json` at runtime
- Preprocess: group by paper ID, dedupe affiliations within each paper
- Loading and error states required

## Display

- Columns: Date | Paper ID (link to `arxiv.org/abs/{id}`) | Affiliations
  (stacked list) | Subjects (pills)
- Subjects as pills, all same neutral color
- Cap visible rows at 100, show "Showing 100 of N matching papers"
- Light mode, restrained palette, zebra striping
- Row hover state for visual feedback

## Performance

- `useMemo` on filtered list (necessary at this scale)
- Debounce affiliation input 200–300ms
- Static derived values (`uniqueSubjects`) computed once at fetch time

## Accessibility

- Semantic `<table>`, `<thead>`, `<tbody>`, proper `<th>`
- Visible focus states on filters and links
- Run Lighthouse + Axe before submission
