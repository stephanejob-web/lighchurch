import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import api from '../lib/axios';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    className?: string;
    label?: string;
}

export function ImageUpload({ value, onChange, className, label = "Déposez votre image ici" }: ImageUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        // Validation (5MB - matching backend)
        if (file.size > 5 * 1024 * 1024) {
            alert("L'image est trop volumineuse (Max 5MB)");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onChange(res.data.url);
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'upload");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering click on container
        onChange('');
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className={className}>
            <div
                className={`relative flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
                    ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-900/50 hover:bg-gray-800 hover:border-gray-500'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleChange}
                />

                {loading ? (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-xs">Chargement...</span>
                    </div>
                ) : value ? (
                    <div className="relative w-full h-full group">
                        <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-medium">Changer l'image</span>
                        </div>
                        <button
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg z-10"
                            title="Supprimer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <div className={`p-3 rounded-full ${dragActive ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                            <UploadCloud className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-300">{label}</p>
                            <p className="text-xs text-gray-500 mt-1">Glissez une image ou cliquez</p>
                            <p className="text-[10px] text-gray-600 mt-1">JPG, PNG, WEBP (Max 5MB)</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
