"use client";

import { useRef, useState } from "react";
import { hasPublicSupabaseEnv } from "@/lib/supabase";

interface UploadPanelProps {
  submissionId?: string;
  roundId: string;
}

const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "student-submissions";

type DirectoryInput = HTMLInputElement & {
  directory?: boolean;
  webkitdirectory?: boolean;
};

function getDisplayName(file: File) {
  return file.webkitRelativePath || file.name;
}

function getSafeUploadName(file: File) {
  const extension = file.name.includes(".") ? `.${file.name.split(".").pop()?.toLowerCase()}` : "";
  return `${globalThis.crypto.randomUUID()}${extension}`;
}

export function UploadPanel({ submissionId, roundId }: UploadPanelProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("اختر الملفات ثم اضغط رفع الملفات.");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const directoryInputRef = useRef<DirectoryInput | null>(null);

  function setDirectoryPicker(node: HTMLInputElement | null) {
    if (!node) {
      directoryInputRef.current = null;
      return;
    }

    const directoryNode = node as DirectoryInput;
    directoryNode.webkitdirectory = true;
    directoryNode.directory = true;
    directoryNode.multiple = true;
    directoryInputRef.current = directoryNode;
  }

  async function uploadFiles() {
    if (!hasPublicSupabaseEnv) {
      setMessage("لا يمكن الرفع الآن لأن إعداد التخزين غير مكتمل.");
      return;
    }

    if (files.length === 0) {
      setMessage("لا توجد ملفات مختارة للرفع.");
      return;
    }

    setUploading(true);

    let activeSubmissionId = submissionId;
    const submissionResponse = await fetch("/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        submissionId: activeSubmissionId,
        roundId
      })
    });
    const submissionPayload = await submissionResponse.json();

    if (!submissionResponse.ok) {
      setUploading(false);
      setMessage(submissionPayload.error ?? "تعذر تجهيز التسليم.");
      return;
    }

    activeSubmissionId = submissionPayload.submissionId;
    if (!activeSubmissionId) {
      setUploading(false);
      setMessage("تعذر تحديد التسليم الحالي قبل الرفع.");
      return;
    }
    const confirmedSubmissionId = activeSubmissionId;

    for (const file of files) {
      const displayName = getDisplayName(file);
      const formData = new FormData();
      formData.append("submissionId", confirmedSubmissionId);
      formData.append("originalName", displayName);
      formData.append("file", file, getSafeUploadName(file));

      const uploadResponse = await fetch("/api/submissions", {
        method: "POST",
        body: formData
      });

      if (!uploadResponse.ok) {
        const payload = await uploadResponse.json();
        setUploading(false);
        setMessage(payload.error ?? `فشل رفع ${file.name}.`);
        return;
      }
    }

    setUploading(false);
    setMessage(`تم رفع ${files.length} ملف/ملفات وحفظها في قاعدة البيانات.`);
    setFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (directoryInputRef.current) {
      directoryInputRef.current.value = "";
    }
  }

  function handleSelectedFiles(selected: FileList | null) {
    const nextFiles = Array.from(selected ?? []);
    setFiles(nextFiles);

    if (nextFiles.length === 0) {
      setMessage("لا توجد ملفات مختارة للرفع.");
      return;
    }

    const hasFolders = nextFiles.some((file) => file.webkitRelativePath);
    setMessage(
      hasFolders
        ? `تم اختيار ${nextFiles.length} ملف من مجلد واحد أو أكثر.`
        : `تم اختيار ${nextFiles.length} ملف.`
    );
  }

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2>رفع الملفات</h2>
          <p>يمكنك رفع ملفات منفصلة أو اختيار مجلد كامل، بما فيه PDF و ZIP والصور وأي ملفات أخرى.</p>
        </div>
        <span className="pill">{hasPublicSupabaseEnv ? "Storage مفعل" : "وضع تجريبي"}</span>
      </div>

      <div className="upload-dropzone">
        <strong>اختر الطريقة المناسبة</strong>
        <span>إذا كانت أعمالك داخل مجلد كامل، استخدم اختيار المجلد. إذا كانت منفصلة، استخدم اختيار الملفات.</span>
        <div className="inline-actions">
          <button className="secondary-button" type="button" onClick={() => fileInputRef.current?.click()}>
            اختيار الملفات
          </button>
          <button className="secondary-button" type="button" onClick={() => directoryInputRef.current?.click()}>
            اختيار مجلد كامل
          </button>
        </div>
        <input
          ref={fileInputRef}
          aria-label="رفع ملفات المعرض"
          className="sr-only"
          type="file"
          multiple
          onChange={(event) => handleSelectedFiles(event.target.files)}
        />
        <input
          ref={setDirectoryPicker}
          aria-label="رفع مجلد المعرض"
          className="sr-only"
          type="file"
          multiple
          onChange={(event) => handleSelectedFiles(event.target.files)}
        />
      </div>

      <div className="file-stack">
        {files.length === 0 ? (
          <p className="empty-state">لم يتم اختيار ملفات بعد. سيظهر هنا ملخص الملفات المرفوعة.</p>
        ) : (
          files.map((file) => (
            <div className="file-row" key={`${getDisplayName(file)}-${file.lastModified}`}>
              <span>{getDisplayName(file)}</span>
              <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
          ))
        )}
      </div>

      <div className="inline-actions">
        <button className="primary-button" onClick={uploadFiles} disabled={uploading} type="button">
          {uploading ? "جاري الرفع..." : "رفع الملفات"}
        </button>
      </div>

      <p className="helper-copy" style={{ marginTop: 12 }}>
        {message}
      </p>
    </section>
  );
}
