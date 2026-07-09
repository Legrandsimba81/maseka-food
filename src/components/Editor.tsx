"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Code, Undo, Redo, Heading1, Heading2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface EditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function Editor({ value, onChange, placeholder = "Écrivez votre contenu..." }: EditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Placeholder.configure({ placeholder }),
      Image.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full' } }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4' },
    },
  });

  const uploadImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop lourde (max 5 Mo)");
      return null;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) return data.url;
      toast.error(data.error || "Erreur upload");
      return null;
    } catch {
      toast.error("Erreur réseau");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const url = await uploadImage(file);
      if (url && editor) editor.chain().focus().setImage({ src: url }).run();
    };
    input.click();
  };

  const setLink = () => {
    const url = window.prompt("Entrez l'URL du lien :");
    if (url && editor) editor.chain().focus().setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-600' : ''}`} title="Gras"><Bold size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-600' : ''}`} title="Italique"><Italic size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-600' : ''}`} title="Titre 1"><Heading1 size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-600' : ''}`} title="Titre 2"><Heading2 size={18} /></button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-600' : ''}`} title="Liste à puces"><List size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-600' : ''}`} title="Liste numérotée"><ListOrdered size={18} /></button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <button type="button" onClick={setLink} className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-600' : ''}`} title="Lien"><LinkIcon size={18} /></button>
        <button type="button" onClick={handleImageUpload} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Insérer une image" disabled={isUploading}><ImageIcon size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-600' : ''}`} title="Bloc de code"><Code size={18} /></button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Annuler"><Undo size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Rétablir"><Redo size={18} /></button>
        {isUploading && <span className="text-xs text-gray-500 ml-2">Upload...</span>}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}