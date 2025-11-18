import { EditorWorkspace } from "./_components/EditorWorkspace";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor | VibeEditor",
  description: "Chỉnh sửa ảnh trực tuyến với các công cụ chuyên nghiệp",
};

export default function EditorPage() {
  return <EditorWorkspace />;
}
