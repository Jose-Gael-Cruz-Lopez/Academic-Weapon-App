const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-6 border-b-4 border-ink pb-2 flex justify-between items-end">
        <div>
            <h1 className="font-pixel text-4xl text-ink leading-none">{title}</h1>
            {subtitle && <p className="font-sans text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-1">
            <div className="w-2 h-2 bg-ink"></div>
            <div className="w-2 h-2 bg-ink"></div>
            <div className="w-2 h-2 bg-ink"></div>
        </div>
    </div>
);

export default SectionHeader;
