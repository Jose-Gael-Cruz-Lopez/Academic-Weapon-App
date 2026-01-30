const PixelCard = ({ children, className = "", noPadding = false }) => (
    <div className={`bg-white border-2 border-ink shadow-pixel ${noPadding ? '' : 'p-4'} ${className}`}>
        {children}
    </div>
);

export default PixelCard;
