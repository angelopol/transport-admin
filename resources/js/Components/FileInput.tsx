import { useRef, useState } from 'react';

interface FileInputProps {
    id?: string;
    accept?: string;
    onChange: (file: File | null) => void;
    hint?: string;
    error?: string;
}

export default function FileInput({ id, accept, onChange, hint, error }: FileInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setFileName(file ? file.name : null);
        onChange(file);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFileName(null);
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div>
            <div
                onClick={() => inputRef.current?.click()}
                className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer
                    transition-all duration-150 select-none
                    ${fileName
                        ? 'border-blue-400 bg-blue-50 text-blue-800'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500'
                    }
                    ${error ? 'border-red-400 bg-red-50' : ''}
                `}
            >
                {/* Icon */}
                <span className={`flex-shrink-0 ${fileName ? 'text-blue-500' : 'text-gray-400'}`}>
                    {fileName ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    )}
                </span>

                {/* Text */}
                <span className="flex-1 text-sm truncate">
                    {fileName ?? 'Haz clic para seleccionar un archivo…'}
                </span>

                {/* Clear / Upload button */}
                {fileName ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="flex-shrink-0 text-blue-400 hover:text-red-500 transition-colors"
                        title="Quitar archivo"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                ) : (
                    <span className="flex-shrink-0 text-xs font-semibold text-white bg-gray-400 hover:bg-blue-500 transition-colors px-3 py-1 rounded-full">
                        Examinar
                    </span>
                )}
            </div>

            {/* Hidden native input */}
            <input
                ref={inputRef}
                id={id}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />

            {/* Hint */}
            {hint && !error && (
                <p className="text-xs text-gray-500 mt-1.5">{hint}</p>
            )}

            {/* Error */}
            {error && (
                <p className="text-xs text-red-500 mt-1.5">{error}</p>
            )}
        </div>
    );
}
