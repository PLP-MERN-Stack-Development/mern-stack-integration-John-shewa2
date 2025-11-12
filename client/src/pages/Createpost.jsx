import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { postService } from "../api/api";
import { categoryService } from "../api/api";
import { AuthContext } from "../context/AuthContext";

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAllCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  if (!user) return <p className="text-center mt-10">Please login to create a post.</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!category) {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category); // this must be ObjectId
      if (featuredImage) formData.append("featuredImage", featuredImage);

      const createdPost = await postService.createPost(formData);
      navigate(`/posts/${createdPost.data.slug}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows="8"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Featured Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFeaturedImage(e.target.files[0])}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          {loading ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
