import { useState, useEffect } from "react";

function App() {
  const [papers, setPapers] = useState([]);
  const [uniqueSubjects, setUniqueSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  console.log(papers);
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

    return [...subjects];
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/data/papers.json");

        if (!res.ok) throw new Error("Bad response");

        const data = await res.json();
        const grouped = groupByPaperId(data);
        const subjects = extractUniqueSubjects(data);

        setPapers(grouped);
        setUniqueSubjects(subjects);
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
        {!loading && !error && <p>Loaded {papers.length} papers</p>}
        {error && <p>{error}</p>}
      </header>
      <main>
        <div className="mt-6 rounded-md border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th scope="col" className="px-4 py-2 font-semibold">
                  Date
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
              {papers.slice(0, 100).map((paper) => (
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
