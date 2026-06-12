import { Star } from "lucide-react";

export function StarRating({
  value,
  size = 16,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(value);
        const star = (
          <Star
            style={{ width: size, height: size }}
            className={filled ? "fill-accent text-accent" : "text-ink/25"}
          />
        );
        return onChange ? (
          <button key={i} type="button" aria-label={`${i} star`} onClick={() => onChange(i)}>
            {star}
          </button>
        ) : (
          <span key={i}>{star}</span>
        );
      })}
    </div>
  );
}