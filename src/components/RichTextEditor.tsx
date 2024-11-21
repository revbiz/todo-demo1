'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Extension } from '@tiptap/core';
import { useState } from 'react';

const COLORS = [
  "#000000", // black
  "#EF4444", // red
  "#22C55E", // green
  "#3B82F6", // blue
  "#F59E0B", // yellow
  "#8B5CF6", // purple
];

const FONT_SIZES = [
  { name: 'Small', value: '0.875em' },
  { name: 'Normal', value: '1em' },
  { name: 'Large', value: '1.25em' },
  { name: 'Extra Large', value: '1.5em' },
  { name: 'Huge', value: '2em' },
];

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
            parseHTML: element => element.style.fontSize,
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
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).run();
      },
    };
  },
});

interface RichTextEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange: (html: string) => void;
  minHeight?: string;
}

export default function RichTextEditor({ 
  initialContent = '', 
  placeholder = 'Start typing...',
  onChange,
  minHeight = '2.5rem'
}: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizes, setShowFontSizes] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-disc ml-4 space-y-0',
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-decimal ml-4 space-y-0',
          },
        },
        history: true,
      }),
      TextStyle,
      Color,
      FontSize,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose focus:outline-none min-h-[2.5rem] max-w-none',
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      // Process content to ensure single line returns
      let content = editor.getHTML();
      content = content.replace(/\n\s*\n/g, '\n');
      content = content.replace(/<\/li>\s*<li>/g, '</li><li>');
      content = content.replace(/<\/ul>\s*<ul>/g, '</ul><ul>');
      content = content.replace(/<\/ol>\s*<ol>/g, '</ol><ol>');
      onChange(content);
    },
  });

  if (!editor) {
    return null;
  }

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const toggleBold = () => {
    editor.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor.chain().focus().toggleItalic().run();
  };

  const setFontSize = (size: string) => {
    editor.chain().focus().setFontSize(size).run();
  };

  const toggleBulletList = () => {
    editor.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    editor.chain().focus().toggleOrderedList().run();
  };

  return (
    <div className="w-full">
      <div className="border rounded-md p-2 mb-2">
        <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-gray-50">
          {/* Text Formatting */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBold().run();
            }}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bold') ? 'bg-gray-200' : ''
            }`}
            title="Bold"
          >
            <span className="font-bold text-sm">B</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('italic') ? 'bg-gray-200' : ''
            }`}
            title="Italic"
          >
            <span className="italic text-sm">I</span>
          </button>

          {/* Color Picker Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowColorPicker(!showColorPicker);
            }}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors flex items-center gap-1 ${
              showColorPicker ? 'bg-gray-200' : ''
            }`}
            title="Text Color"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>

          {/* Font Size Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowFontSizes(!showFontSizes);
              }}
              className={`p-1.5 rounded hover:bg-gray-200 transition-colors flex items-center gap-1 ${
                showFontSizes ? 'bg-gray-200' : ''
              }`}
              title="Font Size"
            >
              <span className="text-sm">T</span>
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showFontSizes && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border z-10">
                {FONT_SIZES.map((size) => (
                  <button
                    type="button"
                    key={size.value}
                    onClick={(e) => {
                      e.preventDefault();
                      editor.chain().focus().setFontSize(size.value).run();
                      setShowFontSizes(false);
                    }}
                    className="w-full px-3 py-1 text-left hover:bg-gray-100 transition-colors text-sm"
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* List Controls */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBulletList().run();
            }}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bulletList') ? 'bg-gray-200' : ''
            }`}
            title="Bullet List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleOrderedList().run();
            }}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('orderedList') ? 'bg-gray-200' : ''
            }`}
            title="Numbered List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8h2M3 12h2M3 16h2" />
            </svg>
          </button>
        </div>

        {/* Color Picker Panel */}
        {showColorPicker && (
          <div className="flex flex-wrap gap-2 p-2 border-b">
            {COLORS.map((color) => (
              <button
                type="button"
                key={color}
                onClick={(e) => {
                  e.preventDefault();
                  setColor(color);
                  setShowColorPicker(false);
                }}
                className="w-8 h-8 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:opacity-80 transition-opacity"
                style={{ backgroundColor: color }}
                title={`Set text color to ${color}`}
              />
            ))}
          </div>
        )}

        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
