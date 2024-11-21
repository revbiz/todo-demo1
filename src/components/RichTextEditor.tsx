'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Extension } from '@tiptap/core';

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace('px', ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return {
                style: `font-size: ${attributes.fontSize}px`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize }).run()
      },
    }
  },
});

const fontSizes = [
  { label: 'Small', size: '12' },
  { label: 'Normal', size: '16' },
  { label: 'Large', size: '20' },
  { label: 'Huge', size: '24' },
];

const colors = [
  '#1F2937', // Dark Gray
  '#DC2626', // Red
  '#2563EB', // Blue
  '#059669', // Green
  '#7C3AED', // Purple
  '#EA580C', // Orange
  '#BE185D', // Pink
  '#0369A1', // Light Blue
  '#B45309', // Brown
  '#4B5563', // Gray
  '#4F46E5', // Indigo
  '#0D9488', // Teal
];

interface RichTextEditorProps {
  initialContent?: string;
  onUpdate?: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  minHeight?: string;
}

interface MenuBarProps {
  editor: any;
}

const MenuBar = ({ editor }: MenuBarProps) => {
  const [showColors, setShowColors] = useState(false);
  const [showFontSizes, setShowFontSizes] = useState(false);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b">
      <button
        type="button"
        onClick={() => {
          const color = editor.getAttributes('textStyle').color;
          editor.chain()
            .focus()
            .toggleBold()
            .run();
          if (color) {
            editor.chain()
              .focus()
              .setColor(color)
              .run();
          }
        }}
        className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Italic"
      >
        <em>I</em>
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowColors(!showColors)}
          className="px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1"
          title="Text Color"
        >
          <span className="w-4 h-4 border border-gray-300 rounded-sm" style={{ 
            backgroundColor: editor.getAttributes('textStyle').color || '#1F2937'
          }} />
        </button>
        {showColors && (
          <>
            <div 
              className="fixed inset-0"
              onClick={() => setShowColors(false)}
            />
            <div 
              className="absolute left-0 mt-1 bg-white border rounded-lg shadow-lg z-[9999] w-[156px]"
              style={{ 
                position: 'fixed',
                top: '0',
                left: '0',
                transform: 'translate(var(--x-pos), var(--y-pos))'
              }}
              ref={(el) => {
                if (el) {
                  const button = el.parentElement?.querySelector('button');
                  if (button) {
                    const rect = button.getBoundingClientRect();
                    el.style.setProperty('--x-pos', `${rect.left}px`);
                    el.style.setProperty('--y-pos', `${rect.bottom + 5}px`);
                  }
                }
              }}
            >
              <div className="p-2">
                <div className="grid grid-cols-4 gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-8 h-8 rounded border border-gray-200 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const isBold = editor.isActive('bold');
                        editor.chain()
                          .focus()
                          .setColor(color)
                          .run();
                        if (isBold) {
                          editor.chain()
                            .focus()
                            .toggleBold()
                            .run();
                        }
                        setShowColors(false);
                      }}
                      title={`Set text color`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowFontSizes(!showFontSizes)}
          className="px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1"
          title="Font Size"
        >
          <span className="text-lg">{editor.getAttributes('textStyle').fontSize || '16'}</span>
        </button>
        {showFontSizes && (
          <>
            <div 
              className="fixed inset-0"
              onClick={() => setShowFontSizes(false)}
            />
            <div 
              className="absolute left-0 mt-1 bg-white border rounded-lg shadow-lg z-[9999] w-[156px]"
              style={{ 
                position: 'fixed',
                top: '0',
                left: '0',
                transform: 'translate(var(--x-pos), var(--y-pos))'
              }}
              ref={(el) => {
                if (el) {
                  const button = el.parentElement?.querySelector('button');
                  if (button) {
                    const rect = button.getBoundingClientRect();
                    el.style.setProperty('--x-pos', `${rect.left}px`);
                    el.style.setProperty('--y-pos', `${rect.bottom + 5}px`);
                  }
                }
              }}
            >
              <div className="p-2">
                <div className="flex flex-col gap-1">
                  {fontSizes.map((fontSize) => (
                    <button
                      key={fontSize.size}
                      type="button"
                      className="text-lg rounded hover:bg-gray-100 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        editor.chain().focus().setFontSize(fontSize.size).run();
                        setShowFontSizes(false);
                      }}
                      title={`Set font size to ${fontSize.label}`}
                    >
                      {fontSize.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Bullet List"
      >
        •
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Numbered List"
      >
        1.
      </button>
    </div>
  );
};

export default function RichTextEditor({
  initialContent = '',
  onUpdate,
  readOnly = false,
  placeholder = 'Start typing...',
  minHeight = '2.5rem',
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      TextStyle.configure({
        types: ['textStyle'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      FontSize,
      StarterKit.configure({
        textStyle: true,
        bold: {
          HTMLAttributes: {
            style: 'font-weight: bold',
          },
          keepMarks: true,
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
          HTMLAttributes: {
            class: 'list-disc ml-4 space-y-0',
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
          HTMLAttributes: {
            class: 'list-decimal ml-4 space-y-0',
          },
        },
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose focus:outline-none min-h-[${minHeight}] max-w-none`,
        placeholder,
      },
    },
    onCreate({ editor }) {
      editor.extensionManager.extensions.forEach(extension => {
        if (extension.name === 'bold' || extension.name === 'italic') {
          extension.options.keepMarks = true;
        }
      });
    },
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        let content = editor.getHTML();
        content = content.replace(/\n\s*\n/g, '\n');
        content = content.replace(/<\/li>\s*<li>/g, '</li><li>');
        content = content.replace(/<\/ul>\s*<ul>/g, '</ul><ul>');
        content = content.replace(/<\/ol>\s*<ol>/g, '</ol><ol>');
        onUpdate(content);
      }
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  if (!mounted || !editor) {
    return <div className="w-full min-h-[2.5rem]" />;
  }

  return (
    <div className="w-full">
      <div className="border rounded-md overflow-hidden">
        {!readOnly && <MenuBar editor={editor} />}
        <div className="p-2">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
