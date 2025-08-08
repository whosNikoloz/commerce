"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { Extension } from "@tiptap/core";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Type, PaintBucket, LinkIcon } from "lucide-react";

interface CustomEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

const CustomFontSize = Extension.create({
    name: "customFontSize",
    addGlobalAttributes() {
        return [
            {
                types: ["textStyle"],
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (el) => el.style.fontSize || null,
                        renderHTML: (attrs) => (!attrs.fontSize ? {} : { style: `font-size: ${attrs.fontSize}` }),
                    },
                },
            },
        ];
    },
});

export function CustomEditor({ value, onChange, label }: CustomEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                bulletList: { keepMarks: true },
                orderedList: { keepMarks: true },
                // HardBreak is included; Shift+Enter inserts <br/>
            }),
            TextStyle,
            CustomFontSize,
            Color,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Link.configure({ openOnClick: false }),
        ],
        content: value,
        immediatelyRender: false,
        // 👇 preserve whitespace when parsing HTML into the doc
        parseOptions: { preserveWhitespace: "full" },
        editorProps: {
            attributes: {
                class:
                    [
                        "prose prose-sm dark:prose-invert max-w-none",
                        "focus:outline-none min-h-[300px] px-2 py-2",
                        "whitespace-pre-wrap break-words",
                        "prose-p:my-2 prose-li:my-1",
                    ].join(" "),
            },
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            // keep the same parse option when setting external content
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    return (
        <div className="space-y-2">
            {label && <Label className="text-base font-medium">{label}</Label>}

            <Card className="bg-background border shadow-sm">
                <CardContent className="p-4 space-y-4">
                    {editor && (
                        <div className="overflow-x-auto w-full">
                            <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/30 p-3">
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" onClick={() => editor.chain().focus().toggleBold().run()}>
                                        <Bold className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" onClick={() => editor.chain().focus().toggleItalic().run()}>
                                        <Italic className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" onClick={() => editor.chain().focus().toggleBulletList().run()}>
                                        <List className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                                        <ListOrdered className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" onClick={() => editor.chain().focus().setTextAlign("left").run()}>
                                        <AlignLeft className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" onClick={() => editor.chain().focus().setTextAlign("center").run()}>
                                        <AlignCenter className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" onClick={() => editor.chain().focus().setTextAlign("right").run()}>
                                        <AlignRight className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Type className="w-4 h-4 text-muted-foreground" />
                                    <Select onValueChange={(val) => editor.chain().focus().setMark("textStyle", { fontSize: val }).run()}>
                                        <SelectTrigger className="w-[130px] h-9">
                                            <SelectValue placeholder="Font Size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="12px">12px</SelectItem>
                                            <SelectItem value="14px">14px</SelectItem>
                                            <SelectItem value="16px">16px</SelectItem>
                                            <SelectItem value="20px">20px</SelectItem>
                                            <SelectItem value="24px">24px</SelectItem>
                                            <SelectItem value="32px">32px</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <PaintBucket className="w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="color"
                                        defaultValue="#000000"
                                        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                                        className="w-9 h-9 p-0 border rounded cursor-pointer bg-transparent"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        onClick={() => {
                                            const url = prompt("Enter URL");
                                            if (url) editor.chain().focus().setLink({ href: url }).run();
                                        }}
                                    >
                                        <LinkIcon className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Optional: quick “line break” button (Shift+Enter) */}
                                <Button size="sm" variant="outline" onClick={() => editor.chain().focus().setHardBreak().run()}>
                                    Insert line break
                                </Button>
                            </div>
                        </div>
                    )}

                    <EditorContent editor={editor} />
                </CardContent>
            </Card>
        </div>
    );
}
