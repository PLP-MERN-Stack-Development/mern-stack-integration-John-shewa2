import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
      {post.featuredImage && (
        <img
          src={`http://localhost:5000/uploads/${post.featuredImage}`}
          alt={post.title}
          className="w-full h-48 object-cover rounded mb-4"
        />
      )}
      <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
      <p className="text-gray-600 mb-4">{post.excerpt}</p>
      <Link
        to={`/posts/${post.slug}`}
        className="text-blue-500 hover:underline"
      >
        Read More
      </Link>
    </div>
  );
};

export default PostCard;
