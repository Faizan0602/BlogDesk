import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import BlogCard from "../components/BlogCard";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import { getErrorMessage, normalizeBlogList } from "../utils/api";

const PAGE_LIMIT = 5;

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_LIMIT)), [total]);

  const requestBlogs = useCallback(async () => {
    const response = await api.get("/blogs", {
      params: { page, limit: PAGE_LIMIT, search: debouncedSearch },
    });

    return normalizeBlogList(response.data);
  }, [page, debouncedSearch]);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const payload = await requestBlogs();

      setBlogs(payload.data);
      setTotal(payload.total);
    } catch (error) {
      setError(getErrorMessage(error, "Blogs could not be loaded."));
      setBlogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [requestBlogs]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    let ignore = false;

    async function loadBlogs() {
      try {
        setError("");
        const payload = await requestBlogs();

        if (ignore) {
          return;
        }

        setBlogs(payload.data);
        setTotal(payload.total);
      } catch (error) {
        if (!ignore) {
          setError(getErrorMessage(error, "Blogs could not be loaded."));
          setBlogs([]);
          setTotal(0);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadBlogs();

    return () => {
      ignore = true;
    };
  }, [requestBlogs]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
    setLoading(true);
    setSuccess("");
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    setLoading(true);
  };

  const handlePageChange = (nextPage) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmDelete = async () => {
    if (!blogToDelete) {
      return;
    }

    try {
      setDeletingId(blogToDelete.id);
      setError("");
      await api.delete(`/blogs/${blogToDelete.id}`);
      setSuccess(`"${blogToDelete.title}" was deleted.`);
      setBlogToDelete(null);

      if (blogs.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        await fetchBlogs();
      }
    } catch (error) {
      setError(getErrorMessage(error, "Blog could not be deleted."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Blog library</p>
          <h1>Browse, search, and manage published articles.</h1>
          <p className="muted">This private workspace is available after login.</p>
        </div>
        <Link className="button button-primary" to="/blogs/create">
          Create Blog
        </Link>
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={handleSearchChange} onClear={handleClearSearch} loading={loading} />
        <div className="result-count">
          {loading ? "Loading..." : `${total} ${total === 1 ? "blog" : "blogs"}`}
        </div>
      </div>

      {success && <p className="alert alert-success">{success}</p>}
      {error && (
        <div className="alert alert-error split-alert">
          <span>{error}</span>
          <button className="button button-secondary" type="button" onClick={fetchBlogs}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="card-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="skeleton-card" key={index} />
          ))}
        </div>
      ) : blogs.length > 0 ? (
        <>
          <div className="card-grid">
            {blogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                onDelete={setBlogToDelete}
                deleting={deletingId === blog.id}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      ) : (
        <div className="empty-state">
          <h2>{debouncedSearch ? "No results found" : "No blogs yet"}</h2>
          <p>
            {debouncedSearch
              ? "Try a different title search or clear the search field."
              : "Create the first blog to start building the library."}
          </p>
          {debouncedSearch ? (
            <button className="button button-secondary" type="button" onClick={handleClearSearch}>
              Clear Search
            </button>
          ) : (
            <Link className="button button-primary" to="/blogs/create">
              Create Blog
            </Link>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(blogToDelete)}
        title="Delete this blog?"
        description="This action cannot be undone. The blog will be removed from the backend."
        confirmLabel="Delete Blog"
        loading={Boolean(deletingId)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setBlogToDelete(null)}
      />
    </section>
  );
}

export default Blogs;
