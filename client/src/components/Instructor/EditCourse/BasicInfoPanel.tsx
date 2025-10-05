import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { CATEGORIES, SUBCATEGORIES } from "../../../constants/courseCategories";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import CodeBlock from "@tiptap/extension-code-block";
import Image from "@tiptap/extension-image";
import {
  FaBold,
  FaItalic,
  FaLink,
  FaCode,
  FaListUl,
  FaQuoteRight,
  FaTimes,
} from "react-icons/fa";
import type { Course } from "../../../types/course.type";
import {
  FormInput,
  FormTextArea,
  FormSelect,
  richTextEditorStyles,
  sectionStyles,
} from "../../UI/FormControls";

interface BasicInfoPanelProps {
  course: Course;
  onUpdate: (changes: Partial<Course>) => void;
}

interface FormState {
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
}

const BasicInfoPanel = ({ course, onUpdate }: BasicInfoPanelProps) => {
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState<FormState>({
    title: course.title || "",
    shortDescription: course.shortDescription || "",
    description: course.description || "",
    category: course.category || "",
    subcategory: course.subcategory || "",
    tags: [...(course.tags || [])],
  });

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    onUpdate({ [field]: value });
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      const newTags = [...formData.tags, tag];
      setFormData((prev) => ({ ...prev, tags: newTags }));
      onUpdate({ tags: newTags });
      setTagInput("");
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = formData.tags.filter((tag) => tag !== tagToRemove);
    setFormData((prev) => ({ ...prev, tags: newTags }));
    onUpdate({ tags: newTags });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Write a detailed description of your course...",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-600 hover:text-indigo-800 underline",
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-gray-100 rounded-lg p-4 font-mono text-sm",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
    ],
    content: formData.description,
    editorProps: {
      attributes: {
        class:
          "prose prose-indigo max-w-none min-h-[200px] focus:outline-none p-4",
      },
    },
    onUpdate: ({ editor }) => {
      const newContent = editor?.getHTML();
      if (newContent !== undefined) {
        handleInputChange("description", newContent);
      }
    },
  });

  useEffect(() => {
    if (editor && course.description !== editor.getHTML()) {
      editor.commands.setContent(course.description);
    }
  }, [course.description, editor]);

  const MenuBar = () => {
    if (!editor) return null;

    const addLink = () => {
      const previousUrl = editor.getAttributes("link").href;
      const url = window.prompt("URL", previousUrl);

      if (url === null) {
        return;
      }

      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }

      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    };

    return (
      <div className="flex flex-wrap gap-2 p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("bold")
              ? "bg-gray-200 text-indigo-600"
              : "text-gray-700"
          }`}
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("italic")
              ? "bg-gray-200 text-indigo-600"
              : "text-gray-700"
          }`}
        >
          <FaItalic />
        </button>

        <div className="w-px h-6 bg-gray-300" />

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("heading", { level: 1 })
              ? "bg-gray-200 text-indigo-600"
              : "text-gray-700"
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-gray-200 text-indigo-600"
              : "text-gray-700"
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-gray-200 text-indigo-600"
              : "text-gray-700"
          }`}
        >
          H3
        </button>

        <div className="w-px h-6 bg-gray-300" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("bulletList")
              ? "bg-gray-200 text-indigo-600"
              : "text-gray-700"
          }`}
        >
          <FaListUl />
        </button>

        <div className="w-px h-6 bg-gray-300" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("codeBlock")
              ? "bg-gray-200 text-indigo-600"
              : "text-gray-700"
          }`}
        >
          <FaCode />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("blockquote")
              ? "bg-gray-200 text-indigo-600"
              : "text-gray-700"
          }`}
        >
          <FaQuoteRight />
        </button>

        <div className="w-px h-6 bg-gray-300" />

        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("link")
              ? "bg-gray-200 text-indigo-600"
              : "text-gray-700"
          }`}
        >
          <FaLink />
        </button>
      </div>
    );
  };

  return (
    <div className={sectionStyles.container}>
      <div className="space-y-6">
        {/* Title */}
        <FormInput
          id="title"
          label="Course Title"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="Enter a descriptive title for your course"
        />{" "}
        {/* Short Description */}
        <FormTextArea
          id="shortDescription"
          label="Short Description"
          value={formData.shortDescription}
          onChange={(e) =>
            handleInputChange("shortDescription", e.target.value)
          }
          placeholder="Write a compelling summary of your course..."
          rows={3}
          helperText="Brief description for course listings. Max 200 characters."
        />{" "}
        {/* Category & Subcategory */}
        <div className={`${sectionStyles.grid} ${sectionStyles.gridCols2}`}>
          <FormSelect
            id="category"
            label="Category"
            value={formData.category}
            onChange={(e) => {
              // Reset subcategory when category changes
              handleInputChange("category", e.target.value);
              handleInputChange("subcategory", "");
            }}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </FormSelect>

          <FormSelect
            id="subcategory"
            label="Subcategory"
            value={formData.subcategory}
            onChange={(e) => handleInputChange("subcategory", e.target.value)}
            disabled={!formData.category}
          >
            <option value="">Select a subcategory</option>
            {formData.category &&
              SUBCATEGORIES[formData.category]?.map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
          </FormSelect>
        </div>
        {/* Rich Text Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Description
          </label>
          <div className={richTextEditorStyles.container}>
            <MenuBar />
            <EditorContent
              editor={editor}
              className={richTextEditorStyles.editor}
            />
          </div>
        </div>
        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Add relevant tags to help students find your course (max 10 tags)
          </p>
          <div className="flex space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyPress}
              placeholder="Enter a tag and press Enter"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              maxLength={30}
              disabled={formData.tags.length >= 10}
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!tagInput.trim() || formData.tags.length >= 10}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Add Tag</span>
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700 border border-indigo-200"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 p-1 text-indigo-500 hover:text-indigo-700 focus:outline-none"
                >
                  <FaTimes className="text-xs" />
                </button>
              </span>
            ))}
          </div>
          {formData.tags.length >= 10 && (
            <p className="mt-2 text-sm text-amber-600">
              Maximum number of tags reached (10/10)
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicInfoPanel;
