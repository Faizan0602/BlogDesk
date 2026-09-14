import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getExcerpt(content = "") {
  if (content.length <= 150) {
    return content;
  }

  return `${content.slice(0, 150).trim()}...`;
}

function BlogCard({ blog, onDelete, deleting = false }) {
  const { isAuthenticated, user } = useAuth();
  const title = blog?.title || "Untitled blog";
  const content = blog?.content || "";
  const date = blog?.created_at || blog?.createdAt || blog?.created;
  const canManage = isAuthenticated && user?.id === blog?.user_id;

  return (
    <article className="blog-card">
      <div className="blog-card-body">
        <div className="blog-meta">
          {blog?.id && <span>Blog #{blog.id}</span>}
          {date && <span>{new Date(date).toLocaleDateString()}</span>}
        </div>
        <h2>{title}</h2>
        <p>{getExcerpt(content)}</p>
      </div>

      <div className="blog-card-actions">
        <Link className="button button-secondary" to={`/blogs/${blog.id}`}>
          Read More
        </Link>

        {canManage && (
          <div className="action-cluster">
            <Link className="icon-button text-button" to={`/blogs/edit/${blog.id}`}>
              Edit
            </Link>
            {onDelete && (
              <button
                className="icon-button danger-text"
                type="button"
                onClick={() => onDelete(blog)}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default BlogCard;
