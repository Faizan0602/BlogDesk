import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="page-shell not-found">
      <p className="eyebrow">404</p>
      <h1>Page not found.</h1>
      <p className="muted">The page you are looking for is not part of this BlogDesk frontend.</p>
      <Link className="button button-primary" to="/blogs">
        Back to Blogs
      </Link>
    </section>
  );
}

export default NotFound;
