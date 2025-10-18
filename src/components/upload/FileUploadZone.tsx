import { useCallback, useState } from 'react';
import { Upload, FileText, Image, File as FileIcon } from 'lucide-react';
import { isFileTypeSupported } from '@/lib/fileProcessors';

interface FileUploadZoneProps {
    onFilesSelected: (files: File[]) => void;
    disabled?: boolean;
}

export default function FileUploadZone({ onFilesSelected, disabled }: FileUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            if (disabled) return;

            const files = Array.from(e.dataTransfer.files);
            const supportedFiles = files.filter(isFileTypeSupported);

            if (supportedFiles.length === 0) {
                alert('No supported files found. Please upload PDF, DOCX, PPTX, images, or text files.');
                return;
            }

            if (supportedFiles.length < files.length) {
                alert(
                    `${files.length - supportedFiles.length} file(s) were skipped because they are not supported.`
                );
            }

            onFilesSelected(supportedFiles);
        },
        [disabled, onFilesSelected]
    );

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;

        const files = Array.from(e.target.files || []);
        const supportedFiles = files.filter(isFileTypeSupported);

        if (supportedFiles.length === 0) {
            alert('No supported files found. Please upload PDF, DOCX, PPTX, images, or text files.');
            return;
        }

        onFilesSelected(supportedFiles);
        e.target.value = ''; // Reset input
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <input
                type="file"
                multiple
                accept=".pdf,.docx,.pptx,.txt,image/*"
                onChange={handleFileInput}
                disabled={disabled}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-blue-100 rounded-full">
                    <Upload className="w-8 h-8 text-blue-600" />
                </div>

                <div>
                    <p className="text-lg font-medium text-gray-900 mb-1">
                        Drop files here or click to upload
                    </p>
                    <p className="text-sm text-gray-600">
                        Supports PDF, DOCX, PPTX, images, and text files
                    </p>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>PDF</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <FileIcon className="w-4 h-4" />
                        <span>DOCX</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <FileIcon className="w-4 h-4" />
                        <span>PPTX</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Image className="w-4 h-4" />
                        <span>Images</span>
                    </div>
                </div>
            </div>
        </div>
    );
}