import React, { useState } from "react";
import { trackEvent } from "../Analytics";

interface Metadata {
  title: string;
  description: string;
  keywords: string;
  url: string;
}

const MetadataForm: React.FC = () => {
  const [formData, setFormData] = useState<Metadata>({
    title: "",
    description: "",
    keywords: "",
    url: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let error = "";
    if (name === "title" && !value.trim()) error = "Title is required";
    if (name === "description" && !value.trim())
      error = "Description is required";
    if (name === "url" && (!value.trim() || !value.startsWith("http")))
      error = "Valid URL required";

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.url.trim() || !formData.url.startsWith("http"))
      newErrors.url = "Valid URL required";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length === 0) {
      try {
        const url = "http://localhost:5000/submit-metadata";
        trackEvent("Metadata", "Submitted Form", url);
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        console.log("Server response:", data);
        setSubmitted(true);
      } catch (error) {
        console.error("Error submitting metadata:", error);
      }

      setErrors({});
    } else {
      setErrors(validationErrors);
      setSubmitted(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mt-4">
        <div className="alert alert-success">
          Metadata submitted successfully!
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Submit Metadata</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className={`form-control ${errors.title ? "is-invalid" : ""}`}
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
          <div className="invalid-feedback">{errors.title}</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
          <div className="invalid-feedback">{errors.description}</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Keywords (comma-separated)</label>
          <input
            type="text"
            className="form-control"
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">URL</label>
          <input
            type="text"
            className={`form-control ${errors.url ? "is-invalid" : ""}`}
            name="url"
            value={formData.url}
            onChange={handleChange}
          />
          <div className="invalid-feedback">{errors.url}</div>
        </div>

        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default MetadataForm;
