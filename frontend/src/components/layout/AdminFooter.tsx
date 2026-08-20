export default function AdminFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">C•CAP</span>
        <span className="text-[13px] text-inkmuted">
          © {new Date().getFullYear()} C•CAP. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
