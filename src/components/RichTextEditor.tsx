'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Extension } from '@tiptap/core';
import { useState, useEffect } from 'react';

interface RichTextEditorProps {
  initialContent?: string;
  onUpdate?: (content: string) => void;
  placeholder?: string;
}

const fontSizes = [
  { label: 'Small', value: '0.875em' },
  { label: 'Normal', value: '1em' },
  { label: 'Large', value: '1.25em' },
  { label: 'XL', value: '1.5em' },
];

const colors = [
  { label: 'Default', value: 'inherit' },
  { label: 'Black', value: '#000000' },
  { label: 'Gray', value: '#666666' },
  { label: 'Red', value: '#ff0000' },
  { label: 'Blue', value: '#0000ff' },
  { label: 'Green', value: '#008000' },
];

// Create a custom extension for font size
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
});

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b overflow-x-auto whitespace-nowrap scrollbar-hide">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`min-w-[40px] px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        B
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`min-w-[40px] px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        I
      </button>
      <select
        onChange={(e) => {
          editor.chain().focus().setMark('textStyle', { fontSize: e.target.value }).run();
        }}
        className="min-w-[90px] px-2 py-1 rounded border hover:bg-gray-50"
      >
        <option value="">Size</option>
        {fontSizes.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>
      <select
        onChange={(e) => {
          editor.chain().focus().setColor(e.target.value).run();
        }}
        className="min-w-[90px] px-2 py-1 rounded border hover:bg-gray-50"
      >
        <option value="">Color</option>
        {colors.map((color) => (
          <option key={color.value} value={color.value} style={{ color: color.value }}>
            {color.label}
          </option>
        ))}
      </select>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`min-w-[40px] px-2 py-1 rounded ${editor.isActive('paragraph') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        ¶
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`min-w-[40px] px-2 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`min-w-[40px] px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        •
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`min-w-[40px] px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        1.
      </button>
    </div>
  );
};

export default function RichTextEditor({ initialContent = '', onUpdate, placeholder }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, FontSize],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[100px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getHTML());
      }
    },
    immediatelyRender: false
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-[42px] bg-white border rounded-md" />;
  }

  return (
    <div className="border rounded-md bg-white overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
