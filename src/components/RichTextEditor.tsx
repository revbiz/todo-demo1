'use client';

import { Editor, useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import { Mark, mergeAttributes } from '@tiptap/core';
import { useEffect } from 'react';

interface RichTextEditorProps {
  initialContent?: string;
  onUpdate?: (content: string) => void;
  placeholder?: string;
}

const fontSizes = [
  { label: 'Small', value: '12px' },
  { label: 'Normal', value: '16px' },
  { label: 'Large', value: '20px' },
  { label: 'Huge', value: '24px' },
];

const FontSize = Mark.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => {
          if (!attributes.size) {
            return {};
          }
          return {
            style: `font-size: ${attributes.size}`,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        style: 'font-size',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
});

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const colors = [
    { label: 'Default', value: '#000000' },
    { label: 'Gray', value: '#666666' },
    { label: 'Red', value: '#ff0000' },
    { label: 'Blue', value: '#0000ff' },
    { label: 'Green', value: '#00ff00' },
  ];

  return (
    <div className="menu-bar">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        title="Bold"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        title="Italic"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l-4 4m4-4l-4-4" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'is-active' : ''}
        title="Underline"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10m-10 4h10M5 3v10a7 7 0 0014 0V3" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        title="Bullet List"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
        title="Numbered List"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20h14M7 12h14M7 4h14M3 20h.01M3 12h.01M3 4h.01" />
        </svg>
      </button>
      <select
        value={editor.getAttributes('fontSize').size || '16px'}
        onChange={(e) => {
          const size = e.target.value;
          if (size === '16px') {
            editor.chain().focus().unsetMark('fontSize').run();
          } else {
            editor.chain().focus().setMark('fontSize', { size }).run();
          }
        }}
        className="min-w-[80px] px-2 py-1 text-sm rounded border hover:bg-gray-50"
        title="Font Size"
      >
        {fontSizes.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>
      <select
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        value={editor.getAttributes('textStyle').color || ''}
        className="min-w-[80px] px-2 py-1 text-sm rounded border hover:bg-gray-50"
        title="Text Color"
      >
        <option value="">Color</option>
        {colors.map((color) => (
          <option key={color.value} value={color.value} style={{ color: color.value }}>
            {color.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const RichTextEditor = ({ initialContent, onUpdate, placeholder }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'text-base leading-relaxed',
          },
        },
      }),
      Underline,
      TextStyle,
      Color,
      FontSize,
    ],
    content: initialContent || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate?.(html);
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent || '');
    }
  }, [editor, initialContent]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
