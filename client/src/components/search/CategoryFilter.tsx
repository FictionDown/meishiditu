import { CATEGORY_OPTIONS } from '../../utils/categories';
import { Category } from '../../types';

interface CategoryFilterProps {
  value: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onChange('')}
        className={`px-2.5 py-1 rounded-full text-xs transition ${
          !value
            ? 'bg-gray-800 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        全部
      </button>
      {CATEGORY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(value === opt.value ? '' : opt.value)}
          className={`px-2.5 py-1 rounded-full text-xs transition flex items-center gap-1 ${
            value === opt.value
              ? 'text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={{
            backgroundColor: value === opt.value ? opt.color : undefined,
          }}
        >
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  );
}
