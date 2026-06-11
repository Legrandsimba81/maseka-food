"use client";
import { useState } from "react";

export default function CommentsSection({ slug, initialComments }: { slug: string; initialComments: any[] }) {
  const [comments, setComments] = useState(initialComments);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/articles/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorName, content }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setComments([newComment, ...comments]);
      setAuthorName("");
      setContent("");
    }
    setLoading(false);
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Commentaires ({comments.length})</h3>
      <form onSubmit={submitComment} className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Votre nom"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="input-field"
          required
        />
        <textarea
          placeholder="Votre commentaire"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input-field"
          required
        />
        <button type="submit" disabled={loading} className="btn-primary">Publier</button>
      </form>
      {comments.map(comment => (
        <div key={comment.id} className="border-b py-3">
          <p className="font-semibold">{comment.authorName} <span className="text-xs text-gray-400">le {new Date(comment.createdAt).toLocaleDateString()}</span></p>
          <p className="text-gray-700 dark:text-gray-300 mt-1">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}