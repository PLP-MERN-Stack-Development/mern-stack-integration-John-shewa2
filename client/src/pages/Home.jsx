import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { postService } from "../api/api";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await postService.getAllPosts();

        // Ensure posts is always an array
        const postsArray = Array.isArray(data)
          ? data
          : Array.isArray(data.posts)
          ? data.posts
          : [];

        setPosts(postsArray);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">Latest Posts</h1>

      {loading && <p>Loading posts...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && posts.length === 0 && <p>No posts found.</p>}

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="border rounded p-4 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-700 mb-2">
              {post.excerpt || post.content.substring(0, 150) + "..."}
            </p>
            <Link
              to={`/posts/${post.slug}`}
              className="text-blue-500 hover:underline"
            >
              Read More
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
