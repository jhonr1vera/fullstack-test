interface PageSizeSelectorProps {
  pageSize: number;
  onChange: (size: number) => void;
  options?: number[];
  label?: string;
}

export default function PageSizeSelector({
  pageSize,
  onChange,
  options = [6, 10, 20, 50],
  label = 'Mostrar:',
}: PageSizeSelectorProps) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <span>{label}</span>
      <select
        value={pageSize}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-slate-900 border border-slate-850 text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
