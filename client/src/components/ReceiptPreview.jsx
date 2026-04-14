export function ReceiptPreview({ file, previewUrl }) {
  if (!file) {
    return null;
  }

  const isImage = file.type.startsWith("image/");

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">Receipt preview</p>
          <p className="text-xs text-slate-500">Review the file before submitting</p>
        </div>
        <p className="text-xs font-medium text-slate-500">{file.name}</p>
      </div>

      {isImage ? (
        <img src={previewUrl} alt="Payment receipt preview" className="h-64 w-full object-contain bg-white p-4" />
      ) : (
        <div className="flex h-64 items-center justify-center bg-white p-4 text-center">
          <div className="max-w-xs rounded-3xl border border-slate-200 bg-slate-50 px-6 py-8 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl font-bold text-red-600">
              PDF
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-950">PDF receipt selected</p>
            <p className="mt-1 text-sm text-slate-600">{file.name}</p>
            <p className="mt-2 text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        </div>
      )}
    </div>
  );
}
