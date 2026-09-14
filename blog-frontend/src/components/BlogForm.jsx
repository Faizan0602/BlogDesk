import { useForm } from "react-hook-form";

function BlogForm({
  defaultValues = { title: "", content: "" },
  submitLabel,
  loading = false,
  onSubmit,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
    values: defaultValues,
  });

  return (
    <form className="blog-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          placeholder="Write a clear, searchable title"
          aria-invalid={Boolean(errors.title)}
          {...register("title", {
            required: "Title is required.",
            minLength: {
              value: 3,
              message: "Title must be at least 3 characters.",
            },
          })}
        />
        {errors.title && <p className="field-error">{errors.title.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          rows="12"
          placeholder="Draft the full blog content"
          aria-invalid={Boolean(errors.content)}
          {...register("content", {
            required: "Content is required.",
            minLength: {
              value: 10,
              message: "Content must be at least 10 characters.",
            },
          })}
        />
        {errors.content && <p className="field-error">{errors.content.message}</p>}
      </div>

      <div className="form-actions">
        <button className="button button-secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button className="button button-primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default BlogForm;
