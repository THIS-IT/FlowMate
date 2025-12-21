"use client";
type LoadingOverlayProps = {
  show: boolean;
  label?: string;
};

export function LoadingOverlay({ show, label = "Loading..." }: LoadingOverlayProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 text-slate-800 shadow-lg ring-1 ring-slate-200">
        <span
          className="inline-flex h-5 w-5 items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-sky-600" />
        </span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
    </div>
  );
}
