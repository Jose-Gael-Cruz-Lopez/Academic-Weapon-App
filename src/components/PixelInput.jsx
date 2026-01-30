const PixelInput = ({ label, ...props }) => (
    <div className="flex flex-col gap-1 mb-4">
        {label && <label className="font-pixel text-lg text-ink/70">{label}</label>}
        <input 
            {...props}
            className="w-full bg-white border-2 border-ink p-2 font-sans focus:outline-none focus:ring-2 focus:ring-rpg-blue/50 shadow-pixel-sm" 
        />
    </div>
);

export default PixelInput;
