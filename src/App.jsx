import { useState, useEffect } from "react";

function App() {
  const [papers, setPapers] = useState([]);
  const [uniqueSubjects, setUniqueSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/data/papers.json");

        if (!res.ok) throw new Error("Bad response");

        const data = await res.json();
        setPapers(data);
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
