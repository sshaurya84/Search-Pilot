// src/components/MetadataDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

interface Metadata {
  _id: string;
  url: string;
  title: string;
  description: string;
  keywords: string;
  createdAt: string;
}

interface RankedMetadata {
  url: string;
  title: string;
  score: number;
  count: number;
  avgScore: number;
  rank: number;
}

const MetadataDashboard: React.FC = () => {
  const [metadataList, setMetadataList] = useState<Metadata[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "7" | "30">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchMetadata = async () => {
      const response = await fetch("http://localhost:5000/metadata");
      const data = await response.json();
      setMetadataList(data);
    };
    fetchMetadata();
  }, []);

  const now = new Date();

  // Apply date range filter
  const filteredByDate = metadataList.filter((meta) => {
    const createdAt = new Date(meta.createdAt);
    if (dateRange === "7") {
      return now.getTime() - createdAt.getTime() <= 7 * 24 * 60 * 60 * 1000;
    } else if (dateRange === "30") {
      return now.getTime() - createdAt.getTime() <= 30 * 24 * 60 * 60 * 1000;
    }
    return true;
  });

  // Calculate keyword frequency
  const keywordFrequency: Record<string, number> = {};
  filteredByDate.forEach((meta) => {
    const keywords = meta.keywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    keywords.forEach((k) => {
      keywordFrequency[k] = (keywordFrequency[k] || 0) + 1;
    });
  });

  const keywordChartData = Object.entries(keywordFrequency).map(
    ([keyword, count]) => ({
      keyword,
      count,
    })
  );

  const dateCountMap: Record<string, number> = {};
  filteredByDate.forEach((meta) => {
    const date = new Date(meta.createdAt).toLocaleDateString();
    dateCountMap[date] = (dateCountMap[date] || 0) + 1;
  });

  const submissionChartData = Object.entries(dateCountMap).map(
    ([date, count]) => ({
      date,
      count,
    })
  );

  const aggregatedRanking: Record<string, RankedMetadata> = {};
  metadataList.forEach((meta) => {
    const keywords = meta.keywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const score = keywords.reduce(
      (acc, k) => acc + (keywordFrequency[k] || 0),
      0
    );

    if (!aggregatedRanking[meta.url]) {
      aggregatedRanking[meta.url] = {
        url: meta.url,
        title: meta.title,
        score: 0,
        count: 0,
        avgScore: 0,
        rank: 0,
      };
    }
    aggregatedRanking[meta.url].score += score;
    aggregatedRanking[meta.url].count += 1;
  });

  const rankedMetadata = Object.values(aggregatedRanking)
    .map((item) => ({
      ...item,
      avgScore: item.score / item.count,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  // Apply search
  const searchedMetadata = rankedMetadata.filter((meta) =>
    meta.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedMetadata = searchedMetadata.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(searchedMetadata.length / pageSize);

  return (
    <div className="container mt-5">
      <h2>Metadata Ranking</h2>

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value as any);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </div>

      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Title</th>
            <th>URL</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {paginatedMetadata.map((meta) => (
            <tr key={meta.url}>
              <td>{meta.rank}</td>
              <td>{meta.title}</td>
              <td>
                <a href={meta.url} target="_blank" rel="noopener noreferrer">
                  {meta.url}
                </a>
              </td>
              <td>{meta.avgScore.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-center my-3">
        <button
          className="btn btn-outline-primary mx-2"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="align-self-center">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-outline-primary mx-2"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      <h2 className="mt-5">Keyword Frequency</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={keywordChartData}>
          <XAxis dataKey="keyword" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#007bff" />
        </BarChart>
      </ResponsiveContainer>

      <h2 className="mt-5">URL Submissions Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={submissionChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#28a745" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetadataDashboard;
