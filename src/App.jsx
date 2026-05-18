import { useState, useEffect, useMemo } from "react";

function App() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [groupedSubjects, setGroupedSubjects] = useState({});

  // Filter state
  const [selectedSubject, setSelectedSubject] = useState("");
  const [affiliationQuery, setAffiliationQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [debouncedAffiliationQuery, setDebouncedAffiliationQuery] =
    useState("");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedAffiliationQuery(affiliationQuery),
      300,
    );

    return () => clearTimeout(t);
  }, [affiliationQuery]);

  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      if (selectedSubject && !paper.subject_labels.includes(selectedSubject))
        return false;
      if (debouncedAffiliationQuery) {
        const query = debouncedAffiliationQuery.toLowerCase();
        const match = paper.affiliation.some((aff) =>
          aff.toLowerCase().includes(query),
        );
        if (!match) return false;
      }
      if (dateFrom && paper.created.slice(0, 10) < dateFrom) return false;
      if (dateTo && paper.created.slice(0, 10) > dateTo) return false;
      return true;
    });
  }, [papers, selectedSubject, debouncedAffiliationQuery, dateFrom, dateTo]);

  const sortedPapers = useMemo(() => {
    return [...filteredPapers].sort((a, b) => {
      if (sortDirection === "desc") {
        return b.created.localeCompare(a.created);
      }

      return a.created.localeCompare(b.created);
    });
  }, [filteredPapers, sortDirection]);

  function groupBySubjectPrefix(subjects) {
    const groups = {};

    for (const subj of subjects) {
      const prefix = subj.includes(".") ? subj.split(".")[0] : subj;

      if (!groups[prefix]) {
        groups[prefix] = [];
      }

      groups[prefix].push(subj);
    }

    return groups;
  }

  function groupByPaperId(records) {
    const groups = {};

    for (const item of records) {
      const groupKey = item.id;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: item.id,
          affiliation: [item.author_affiliation],
          subject_labels: item.subject_labels,
          created: item.created,
        };
      } else {
        groups[groupKey].affiliation.push(item.author_affiliation);
      }
    }
    return Object.values(groups);
  }

  function extractUniqueSubjects(records) {
    const subjects = new Set();

    for (const item of records) {
      for (const subj of item.subject_labels) subjects.add(subj);
    }

    return [...subjects].sort();
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/data/papers.json");

        if (!res.ok) throw new Error("Bad response");

        const data = await res.json();
        const grouped = groupByPaperId(data);
        const subjects = extractUniqueSubjects(data);
        const groupedSubjects = groupBySubjectPrefix(subjects);

        setPapers(grouped);
        setGroupedSubjects(groupedSubjects);
      } catch (error) {
        console.error(error);
        setError("Failed to load papers");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <header>
        <h1 className="text-2xl font-bold">arXiv Explorer</h1>
        {loading && <p>Loading... </p>}
        {!loading && !error && (
          <p>
            Showing {Math.min(100, filteredPapers.length)} of{" "}
            {filteredPapers.length} papers
          </p>
        )}
        {error && <p>{error}</p>}
      </header>
      <main>
        <div className="flex flex-col md:flex-row gap-2 my-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="subject-filter" className="text-sm">
              Subject
            </label>
            <select
              id="subject-filter"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">All subjects</option>
              {Object.entries(groupedSubjects).map(([prefix, subjects]) => (
                <optgroup key={prefix} label={prefix}>
                  {subjects.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="affiliation-search-input" className="text-sm">
              Affiliation
            </label>
            <input
              id="affiliation-search-input"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Type to search... "
              value={affiliationQuery}
              onChange={(e) => setAffiliationQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="date-from" className="text-sm">
              From
            </label>
            <input
              type="date"
              id="date-from"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="date-to" className="text-sm">
              To
            </label>
            <input
              type="date"
              id="date-to"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
        <div className="my-4 rounded-md border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th scope="col" className="px-4 py-2 font-semibold">
                  <button
                    className="cursor-pointer"
                    onClick={() =>
                      setSortDirection((prev) =>
                        prev === "desc" ? "asc" : "desc",
                      )
                    }
                  >
                    Date {sortDirection === "desc" ? "↓" : "↑"}
                  </button>
                </th>
                <th scope="col" className="px-4 py-2 font-semibold">
                  Paper ID
                </th>
                <th scope="col" className="px-4 py-2 font-semibold">
                  Affiliations
                </th>
                <th scope="col" className="px-4 py-2 font-semibold">
                  Subjects
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPapers.slice(0, 100).map((paper) => (
                <tr
                  key={paper.id}
                  className="border-b border-gray-200 even:bg-gray-50 hover:bg-gray-100 last:border-0 text-sm"
                >
                  <td className="px-4 py-2 whitespace-nowrap">
                    {paper.created.slice(0, 10)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{paper.id}</td>
                  <td className="px-4 py-2 max-w-xs align-top">
                    <ul>
                      {paper.affiliation.map((aff, index) => (
                        <li key={index}>{aff}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-2 min-w-[240px] align-top">
                    <div className="flex flex-wrap gap-1">
                      {paper.subject_labels.map((subj) => (
                        <span
                          key={subj}
                          className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-[.75em] text-gray-600 inset-ring inset-ring-gray-200"
                        >
                          {subj}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;
