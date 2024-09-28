import YooptaEditor, { createYooptaEditor } from "@yoopta/editor";

import Paragraph from "@yoopta/paragraph";
import Blockquote from "@yoopta/blockquote";
import Embed from "@yoopta/embed";
import Image from "@yoopta/image";
import Link from "@yoopta/link";
import Callout from "@yoopta/callout";
import Video from "@yoopta/video";
import File from "@yoopta/file";
import { NumberedList, BulletedList, TodoList } from "@yoopta/lists";
import {
  Bold,
  Italic,
  CodeMark,
  Underline,
  Strike,
  Highlight,
} from "@yoopta/marks";
import { HeadingOne, HeadingThree, HeadingTwo } from "@yoopta/headings";
import Code from "@yoopta/code";
import ActionMenuList, {
  DefaultActionMenuRender,
} from "@yoopta/action-menu-list";
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";
import LinkTool, { DefaultLinkToolRender } from "@yoopta/link-tool";
// import { DividerPlugin } from './customPlugins/Divider';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { withSavingToDatabaseValue } from "./initValue";
import { PageWithBlocks } from "@/lib/types/types";
import { useParams } from "next/navigation";
import { savePageBlocks } from "@/services/pageService/pageService";
import { uploadMedia } from "@/services/mediaService/mediaService";
import { usePagesStore } from "@/stores/pages/pagesStore";
import { Skeleton } from "../ui/skeleton";
import { Loader2 } from "lucide-react";

const plugins = [
  Paragraph,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  Blockquote,
  Callout,
  NumberedList,
  BulletedList,
  TodoList,
  Code,
  Link,
  Embed,
  Image.extend({
    options: {
      async onUpload(file) {
        const data = await uploadMedia(file, "image");

        return {
          src: data.secure_url,
          alt: "cloudinary",
          sizes: {
            width: data.width || 0,
            height: data.height || 0,
          },
        };
      },
    },
  }),
  Video.extend({
    options: {
      onUpload: async (file) => {
        const data = await uploadMedia(file, "video");
        return {
          src: data.secure_url,
          alt: "cloudinary",
          sizes: {
            width: data.width || 0,
            height: data.height || 0,
          },
        };
      },
      onUploadPoster: async (file) => {
        const image = await uploadMedia(file, "file");
        return image.secure_url;
      },
    },
  }),
  // File.extend({
  //   options: {
  //     onUpload: async (file) => {
  //       const response = await uploadToCloudinary(file, 'auto');
  //       return { src: response.secure_url, format: response.format, name: response.name, size: response.bytes };
  //     },
  //   },
  // }),
];

const TOOLS = {
  ActionMenu: {
    render: DefaultActionMenuRender,
    tool: ActionMenuList,
  },
  Toolbar: {
    render: DefaultToolbarRender,
    tool: Toolbar,
  },
  LinkTool: {
    render: DefaultLinkToolRender,
    tool: LinkTool,
  },
};

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

function WithSavingToDatabase() {
  const editor = useMemo(() => createYooptaEditor(), []);
  const pagesState = usePagesStore();
  const selectionRef = useRef(null);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const onSaveToServer = async () => {
    const editorContent = editor.getEditorValue();
    try {
      if (pagesState.currentBlocks) {
        await savePageBlocks(pagesState.currentBlocks.pageId, editorContent);
        console.log("saved");
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  /**
   * This function is used to save the editor content to the server.
   * It uses a timeout to prevent the function from being called too often.
   * The timeout is reset every time the editor content changes.
   * The timeout is set to 1 second.
   * The function is called every time the editor content changes.
   */
  const handleEditorChange = useCallback(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    const newTimeout = setTimeout(() => {
      onSaveToServer();
    }, 1000);
    setSaveTimeout(newTimeout);
  }, [saveTimeout]);

  useEffect(() => {
    editor.on("change", handleEditorChange);
    return () => {
      editor.off("change", handleEditorChange);
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [editor, handleEditorChange, saveTimeout]);

  if (pagesState.isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  return (
    <div ref={selectionRef} className="m-10">
      {pagesState.currentBlocks && (
        <YooptaEditor
          className="min-w-full h-full"
          editor={editor}
          plugins={plugins}
          tools={TOOLS}
          marks={MARKS}
          selectionBoxRoot={selectionRef}
          value={pagesState.currentBlocks.blocks}
        />
      )}
    </div>
  );
}

export default WithSavingToDatabase;
