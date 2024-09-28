import YooptaEditor, {
  createYooptaEditor,
  YooptaContentValue,
} from "@yoopta/editor";

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

import { useEffect, useMemo, useRef } from "react";
import { withSavingToDatabaseValue } from "./initValue";
import { PageWithBlocks } from "@/lib/types/types";
import { useParams } from "next/navigation";
import { savePageBlocks } from "@/services/pageService/pageService";

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
  // Image.extend({
  //   options: {
  //     async onUpload(file) {
  //       const data = await uploadToCloudinary(file, 'image');

  //       return {
  //         src: data.secure_url,
  //         alt: 'cloudinary',
  //         sizes: {
  //           width: data.width,
  //           height: data.height,
  //         },
  //       };
  //     },
  //   },
  // }),
  // Video.extend({
  //   options: {
  //     onUpload: async (file) => {
  //       const data = await uploadToCloudinary(file, 'video');
  //       return {
  //         src: data.secure_url,
  //         alt: 'cloudinary',
  //         sizes: {
  //           width: data.width,
  //           height: data.height,
  //         },
  //       };
  //     },
  //     onUploadPoster: async (file) => {
  //       const image = await uploadToCloudinary(file, 'image');
  //       return image.secure_url;
  //     },
  //   },
  // }),
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

function WithSavingToDatabase({ blocks }: { blocks: PageWithBlocks }) {
  const editor = useMemo(() => createYooptaEditor(), []);
  const selectionRef = useRef(null);

  const fetchToServer = async (data: YooptaContentValue) => {
    //...your async call to server
    console.log(data);
    await savePageBlocks(blocks.pageId, data);
  };

  const onSaveToServer = async () => {
    const editorContent = editor.getEditorValue();
    try {
      await fetchToServer(editorContent);
      console.log("saved");
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };
  // function handleChange(value: YooptaContentValue) {
  //   console.log("DATA ON CHANGE", value);
  // }

  // useEffect(() => {
  //   editor.on("change", handleChange);
  //   return () => {
  //     editor.off("change", handleChange);
  //   };
  // }, [editor]);
  return (
    <div ref={selectionRef} className="m-10">
      <button
        type="button"
        onClick={onSaveToServer}
        className="bg-[#007aff] text-[14px] text-nowrap my-2 mr-0 md:mr-4 text-[#fff] max-w-[100px] px-4 py-2 rounded-md"
      >
        Save data
      </button>
      {blocks && (
        <YooptaEditor
          className="min-w-full h-full"
          editor={editor}
          plugins={plugins}
          tools={TOOLS}
          marks={MARKS}
          selectionBoxRoot={selectionRef}
          value={blocks.blocks || []}
        />
      )}
    </div>
  );
}

export default WithSavingToDatabase;
