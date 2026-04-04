"use client";

interface Props {
  rating: number;
  readonly?: boolean;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({
  rating,
  readonly = false,
  onChange,
  size = "md",
}: Props) {
  const sizeClass = {
    sm: "text-sm gap-0.5",
    md: "text-lg gap-0.5",
    lg: "text-xl gap-1",
  }[size];

  return (
    <div className={`flex items-center ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
        >
          <span className={star <= rating ? "text-amber-400" : "text-gray-200"}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
