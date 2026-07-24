interface CityFilterProps {
  value: string;
  onChange: (city: string) => void;
  cities: string[];
}

export default function CityFilter({ value, onChange, cities }: CityFilterProps) {
  if (cities.length === 0) return null;

  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 transition cursor-pointer"
      >
        <option value="">全部城市</option>
        {cities.map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  );
}
