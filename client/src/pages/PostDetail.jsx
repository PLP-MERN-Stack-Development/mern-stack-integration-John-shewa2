import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { postService } from "../api/api";
import { AuthContext } from "../context/AuthContext";

const PostDetail = () => {
  const { slug } = useParams();
  const { user } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPost = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await postService.getPost(slug);
      setPost(data.data); // Ensure correct access
    } catch (err) {
      console.error(err);
      setError("Failed to fetch post.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment) return;

    try {
      await postService.addComment(post.slug, { content: comment });
      setComment("");
      fetchPost(); // reload post to show new comment
    } catch (err) {
      console.error(err);
      setError("Failed to add comment.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading post...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!post) return <p className="text-center mt-10">Post not found.</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-700 mb-6">{post.content}</p>

      {post.featuredImage && (
        <img
          src={post.featuredImage.startsWith("/") ? post.featuredImage : `/uploads/${post.featuredImage}`}
          alt={post.title}
          className="mb-6 w-full rounded"
        />
      )}

      <h2 className="text-2xl font-semibold mb-4">Comments</h2>
      <div className="space-y-4 mb-6">
        {post.comments.length === 0 && <p>No comments yet.</p>}
        {post.comments.map((c, index) => (
          <div key={index} className="border rounded p-3">
            <p className="font-semibold">{c.user?.name || "Anonymous"}</p>
            <p>{c.content}</p>
            <p className="text-gray-500 text-sm">
              {new Date(c.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={handleCommentSubmit} className="space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Add Comment
          </button>
        </form>
      ) : (
        <p className="text-center text-gray-600">Please login to add a comment.</p>
      )}
    </div>
  );
};

export default PostDetail;
