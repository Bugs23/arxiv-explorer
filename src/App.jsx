import { useState, useEffect } from "react";

function App() {
  const [papers, setPapers] = useState([]);
  const [uniqueSubjects, setUniqueSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <h1 className="text-2xl font-bold">arXiv Explorer</h1>
      {loading && <p>Loading... </p>}
      {!loading && !error && <p>Loaded {papers.length} papers</p>}
      {error && <p>{error}</p>}
    </div>
  );
}

export default App;
