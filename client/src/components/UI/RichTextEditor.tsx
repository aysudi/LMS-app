import { useEditor, EditorContent } from "@tiptap/react";
import { useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlock from "@tiptap/extension-code-block";
import Color from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Blockquote from "@tiptap/extension-blockquote";

import {
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaCode,
  FaQuoteRight,
  FaLink,
  FaUnlink,
  FaTimes,
  FaCheck,
  FaExternalLinkAlt,
} from "react-icons/fa";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  icon: React.ReactNode;
  tooltip: string;
}

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  selectedText: string;
  currentUrl?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive,
  icon,
  tooltip,
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded hover:bg-gray-200 transition-colors duration-200 ${
      isActive ? "bg-gray-200 text-indigo-600" : "text-gray-700"
    }`}
    title={tooltip}
    type="button"
  >
    {icon}
  </button>
);

const LinkModal: React.FC<LinkModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedText,
  currentUrl,
}) => {
  const [url, setUrl] = useState(currentUrl || "");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaExternalLinkAlt className="mr-2 text-indigo-600" />
            Add Link
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Selected text:</p>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="text-sm font-medium text-gray-900">
              "{selectedText}"
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              autoFocus
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!url.trim()}
              className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
            >
              <FaCheck className="mr-2" />
              Add Link
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RichTextEditor = ({
  content,
  onChange,
  placeholder = "Start writing...",
}: RichTextEditorProps) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [currentLinkUrl, setCurrentLinkUrl] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "prose-ul",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "prose-ol",
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "prose-li",
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class:
            "prose-blockquote border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4",
        },
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        emptyEditorClass: "is-editor-empty",
      }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        autolink: true,
        protocols: ["http", "https", "ftp", "mailto"],
        HTMLAttributes: {
          class:
            "text-indigo-600 hover:text-indigo-800 underline cursor-pointer",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg shadow-sm",
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-gray-100 rounded-lg p-4 font-mono text-sm border",
        },
      }),
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-indigo prose-sm max-w-none min-h-[200px] focus:outline-none p-4 text-gray-900 prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4",
        spellcheck: "false",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);

    if (text === "") {
      // Show a better error message
      const errorDiv = document.createElement("div");
      errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #FEF2F2;
        border: 1px solid #FCA5A5;
        color: #DC2626;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      `;
      errorDiv.textContent = "Please select some text first to add a link";
      document.body.appendChild(errorDiv);

      setTimeout(() => {
        document.body.removeChild(errorDiv);
      }, 3000);
      return;
    }

    const previousUrl = editor.getAttributes("link").href;
    setSelectedText(text);
    setCurrentLinkUrl(previousUrl || "");
    setShowLinkModal(true);
  };

  const handleLinkSubmit = (url: string) => {
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Validate URL format
    let validUrl = url;
    if (!url.match(/^https?:\/\//)) {
      validUrl = `https://${url}`;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: validUrl, target: "_blank" })
      .run();
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div className="rich-text-editor border border-gray-300 rounded-lg overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .rich-text-editor .ProseMirror {
            outline: none;
          }
          .rich-text-editor .ProseMirror ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin: 1rem 0;
          }
          .rich-text-editor .ProseMirror ol {
            list-style-type: decimal;
            padding-left: 1.5rem;
            margin: 1rem 0;
          }
          .rich-text-editor .ProseMirror li {
            margin: 0.25rem 0;
          }
          .rich-text-editor .ProseMirror blockquote {
            border-left: 4px solid #d1d5db !important;
            padding-left: 1rem !important;
            font-style: italic !important;
            color: #6b7280 !important;
            margin: 1rem 0 !important;
            background-color: #f9fafb !important;
            padding: 1rem !important;
            border-radius: 0.375rem !important;
          }
          .rich-text-editor .ProseMirror a {
            color: #4f46e5 !important;
            text-decoration: underline !important;
          }
          .rich-text-editor .ProseMirror a:hover {
            color: #3730a3 !important;
          }
          .rich-text-editor .ProseMirror .is-editor-empty:first-child::before {
            color: #9ca3af;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
        `,
        }}
      />
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center space-x-2 flex-wrap">
        <div className="flex items-center space-x-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            icon={<FaBold />}
            tooltip="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            icon={<FaItalic />}
            tooltip="Italic"
          />
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex items-center space-x-1">
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive("heading", { level: 1 })}
            icon={<>H1</>}
            tooltip="Heading 1"
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            icon={<>H2</>}
            tooltip="Heading 2"
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive("heading", { level: 3 })}
            icon={<>H3</>}
            tooltip="Heading 3"
          />
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex items-center space-x-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            icon={<FaListUl />}
            tooltip="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            icon={<FaListOl />}
            tooltip="Numbered List"
          />
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex items-center space-x-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            icon={<FaCode />}
            tooltip="Code Block"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            icon={<FaQuoteRight />}
            tooltip="Quote"
          />
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex items-center space-x-1">
          <ToolbarButton
            onClick={addLink}
            isActive={editor.isActive("link")}
            icon={<FaLink />}
            tooltip="Add Link"
          />
          <ToolbarButton
            onClick={removeLink}
            isActive={false}
            icon={<FaUnlink />}
            tooltip="Remove Link"
          />
        </div>
      </div>

      <EditorContent editor={editor} />

      <LinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSubmit={handleLinkSubmit}
        selectedText={selectedText}
        currentUrl={currentLinkUrl}
      />
    </div>
  );
};

export default RichTextEditor;
