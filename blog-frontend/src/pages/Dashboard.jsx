import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import BlogCard from "../components/BlogCard";
import { getErrorMessage, normalizeBlogList } from "../utils/api";

function Dashboard() {
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestDashboard = async () => {
    const response = await api.get("/blogs", {
      params: { page: 1, limit: 5, search: "" },
    });

    return normalizeBlogList(response.data);
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const payload = await requestDashboard();
      setBlogs(payload.data);
      setTotal(payload.total);
    } catch (error) {
      setError(getErrorMessage(error, "Dashboard data could not be loaded."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        const payload = await requestDashboard();

        if (ignore) {
          return;
        }

        setBlogs(payload.data);
        setTotal(payload.total);
      } catch (error) {
        if (!ignore) {
          setError(getErrorMessage(error, "Dashboard data could not be loaded."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="page-shell">
      <div className="page-header dashboard-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Welcome back.</h1>
          <p className="muted">Review the current blog library and jump into publishing.</p>
        </div>
        <Link className="button button-primary" to="/blogs/create">
          Create Blog
        </Link>
      </div>

      {error && (
        <div className="alert alert-error split-alert">
          <span>{error}</span>
          <button className="button button-secondary" type="button" onClick={fetchDashboard}>
            Retry
          </button>
        </div>
      )}

      <div className="stats-grid">
        <article className="stat-card">
          <span>Total Blogs</span>
          <strong>{loading ? "--" : total}</strong>
        </article>
        <article className="stat-card">
          <span>Recent Loaded</span>
          <strong>{loading ? "--" : blogs.length}</strong>
        </article>
        <article className="stat-card">
          <span>API Source</span>
          <strong>FastAPI</strong>
        </article>
      </div>

      <div className="section-heading">
        <div>
          <h2>Recent blogs</h2>
          <p className="muted">Derived from the paginated blog endpoint.</p>
        </div>
        <Link to="/blogs" className="text-link">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="card-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="skeleton-card" key={index} />
          ))}
        </div>
      ) : blogs.length > 0 ? (
        <div className="card-grid">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No blogs yet</h2>
          <p>Create the first article to populate the dashboard.</p>
          <Link className="button button-primary" to="/blogs/create">
            Create Blog
          </Link>
        </div>
      )}
    </section>
  );
}

export default Dashboard;
