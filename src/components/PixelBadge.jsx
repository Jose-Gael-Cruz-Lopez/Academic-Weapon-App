const PixelBadge = ({ label, color = "bg-gray-200", className="" }) => (
    <span className={`${color} border border-ink text-ink text-xs px-2 py-0.5 font-bold uppercase tracking-tight ${className}`}>
        {label}
    </span>
);

export default PixelBadge;
