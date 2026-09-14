import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import BlogForm from "../components/BlogForm";
import { getErrorMessage } from "../utils/api";

function CreateBlog() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const response = await api.post("/blogs", values);
      setSuccess("Blog created successfully.");
      const nextPath = response.data?.id ? `/blogs/${response.data.id}` : "/blogs";
      window.setTimeout(() => navigate(nextPath), 500);
    } catch (error) {
      setError(getErrorMessage(error, "Blog could not be created."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-shell narrow-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Create</p>
          <h1>Draft a new blog.</h1>
          <p className="muted">Only title and content are supported by the current backend schema.</p>
        </div>
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}

      <div className="form-panel">
        <BlogForm
          submitLabel="Publish Blog"
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/blogs")}
        />
      </div>
    </section>
  );
}

export default CreateBlog;
