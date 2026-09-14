import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/api";

function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  const requestBlog = useCallback(async () => {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError("");
      const payload = await requestBlog();
      setBlog(payload);
    } catch (error) {
      setError(getErrorMessage(error, "Blog could not be loaded."));
      setBlog(null);
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

        setBlog(payload);
      } catch (error) {
        if (!ignore) {
          setError(getErrorMessage(error, "Blog could not be loaded."));
          setBlog(null);
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

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/blogs/${id}`);
      navigate("/blogs", { replace: true });
    } catch (error) {
      setError(getErrorMessage(error, "Blog could not be deleted."));
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Blog details</p>
          <h1>{loading ? "Loading blog..." : blog?.title || "Blog not found"}</h1>
        </div>
        <Link className="button button-secondary" to="/blogs">
          Back to Blogs
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

      {loading ? (
        <div className="detail-article skeleton-detail" />
      ) : blog ? (
        <article className="detail-article">
          <div className="blog-meta">
            <span>Blog #{blog.id}</span>
          </div>
          <h1>{blog.title}</h1>
          <div className="detail-content">{blog.content}</div>

          {user?.id === blog.user_id && (
            <div className="detail-actions">
              <Link className="button button-primary" to={`/blogs/edit/${blog.id}`}>
                Edit Blog
              </Link>
              <button className="button button-secondary danger-text" type="button" onClick={() => setConfirmOpen(true)}>
                Delete
              </button>
            </div>
          )}
        </article>
      ) : (
        <div className="empty-state">
          <h2>Blog not found</h2>
          <p>The backend did not return a blog for this ID.</p>
          <Link className="button button-primary" to="/blogs">
            View Blogs
          </Link>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this blog?"
        description="This action cannot be undone. The blog will be removed from the backend."
        confirmLabel="Delete Blog"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}

export default BlogDetails;
