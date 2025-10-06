import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlock from "@tiptap/extension-code-block";
import Color from "@tiptap/extension-color";

import {
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaCode,
  FaQuoteRight,
  FaLink,
  FaUnlink,
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

const RichTextEditor = ({
  content,
  onChange,
  placeholder = "Start writing...",
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        emptyEditorClass: "is-editor-empty",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-indigo-600 hover:text-indigo-800 underline cursor-pointer",
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
          "prose prose-indigo prose-sm max-w-none min-h-[200px] focus:outline-none p-4 text-gray-900",
        spellcheck: "false",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

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

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="rich-text-editor border border-gray-300 rounded-lg overflow-hidden">
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
            onClick={() => editor.chain().focus().unsetLink().run()}
            isActive={false}
            icon={<FaUnlink />}
            tooltip="Remove Link"
          />
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
