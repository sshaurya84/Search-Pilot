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
}

const MetadataDashboard: React.FC = () => {
  const [metadataList, setMetadataList] = useState<Metadata[]>([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      const response = await fetch("http://localhost:5000/metadata");
      const data = await response.json();
      setMetadataList(data);
    };
    fetchMetadata();
  }, []);

  // Calculate keyword frequency across all metadata
  const keywordFrequency: Record<string, number> = {};
  metadataList.forEach((meta) => {
    const keywords = meta.keywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    keywords.forEach((k) => {
      keywordFrequency[k] = (keywordFrequency[k] || 0) + 1;
    });
  });

  // Keyword frequency chart data
  const keywordChartData = Object.entries(keywordFrequency).map(
    ([keyword, count]) => ({
      keyword,
      count,
    })
  );

  // Submissions over time chart data
  const dateCountMap: Record<string, number> = {};
  metadataList.forEach((meta) => {
    const date = new Date(meta.createdAt).toLocaleDateString();
    dateCountMap[date] = (dateCountMap[date] || 0) + 1;
  });
  const submissionChartData = Object.entries(dateCountMap).map(
    ([date, count]) => ({
      date,
      count,
    })
  );

  // Aggregate and rank metadata by URL
  const aggregatedRanking: Record<string, RankedMetadata> = {};

  metadataList.forEach((meta) => {
    const keywords = meta.keywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    // Calculate score for this metadata entry based on keyword frequency
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
      };
    }
    aggregatedRanking[meta.url].score += score;
    aggregatedRanking[meta.url].count += 1;
  });

  // Calculate average score and create sorted ranked array
  const rankedMetadata = Object.values(aggregatedRanking)
    .map((item) => ({
      ...item,
      avgScore: item.score / item.count,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  return (
    <div className="container mt-5">
      <h2> Keyword Frequency</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={keywordChartData}>
          <XAxis dataKey="keyword" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#007bff" />
        </BarChart>
      </ResponsiveContainer>

      <h2 className="mt-5"> URL Submissions Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={submissionChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#28a745" />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="mt-5"> Metadata Ranking</h2>
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
          {rankedMetadata.slice(0, 10).map((meta, index) => (
            <tr key={meta.url}>
              <td>{index + 1}</td>
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
    </div>
  );
};

export default MetadataDashboard;
