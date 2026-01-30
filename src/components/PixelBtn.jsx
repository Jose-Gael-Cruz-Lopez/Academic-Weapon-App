const PixelBtn = ({ children, onClick, variant = "primary", className = "", icon = null }) => {
    const bg = variant === "primary" ? "bg-white" : "bg-ink text-white";
    return (
        <button 
            onClick={onClick}
            className={`${bg} border-2 border-ink px-4 py-2 font-pixel text-lg uppercase tracking-wide shadow-pixel transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] flex items-center gap-2 justify-center ${className}`}
        >
            {icon && <iconify-icon icon={icon} width="20"></iconify-icon>}
            {children}
        </button>
    );
};

export default PixelBtn;
