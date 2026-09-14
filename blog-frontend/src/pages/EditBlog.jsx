import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import BlogForm from "../components/BlogForm";
import { getErrorMessage } from "../utils/api";

function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [defaultValues, setDefaultValues] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const requestBlog = useCallback(async () => {
    const response = await api.get(`/blogs/${id}`);

    return {
      title: response.data?.title || "",
      content: response.data?.content || "",
    };
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError("");
      const payload = await requestBlog();
      setDefaultValues(payload);
    } catch (error) {
      setError(getErrorMessage(error, "Blog could not be loaded for editing."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadBlog() {
      try {
        const payload = await requestBlog();

        if (ignore) {
          return;
        }

        setDefaultValues(payload);
      } catch (error) {
        if (!ignore) {
          setError(getErrorMessage(error, "Blog could not be loaded for editing."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadBlog();

    return () => {
      ignore = true;
    };
  }, [requestBlog]);

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await api.put(`/blogs/${id}`, values);
      setSuccess("Blog updated successfully.");
      window.setTimeout(() => navigate(`/blogs/${id}`), 500);
    } catch (error) {
      setError(getErrorMessage(error, "Blog could not be updated."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-shell narrow-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Edit</p>
          <h1>Refine this blog.</h1>
        </div>
        <Link className="button button-secondary" to={`/blogs/${id}`}>
          View Blog
        </Link>
      </div>

      {error && (
        <div className="alert alert-error split-alert">
          <span>{error}</span>
          <button className="button button-secondary" type="button" onClick={fetchBlog}>
            Retry
          </button>
        </div>
      )}
      {success && <p className="alert alert-success">{success}</p>}

      {loading ? (
        <div className="form-panel skeleton-form" />
      ) : (
        <div className="form-panel">
          <BlogForm
            defaultValues={defaultValues}
            submitLabel="Save Changes"
            loading={saving}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/blogs/${id}`)}
          />
        </div>
      )}
    </section>
  );
}

export default EditBlog;
