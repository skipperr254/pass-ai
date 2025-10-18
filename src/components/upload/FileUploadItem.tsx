import { FileText, Image, File as FileIcon, CheckCircle, XCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '../ui/progress';

interface FileUploadItemProps {
    fileName: string;
    fileSize: number;
    fileType: string;
    status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
    progress: number;
    error?: string;
    onRemove: () => void;
}

export default function FileUploadItem({
    fileName,
    fileSize,
    fileType,
    status,
    progress,
    error,
    onRemove,
}: FileUploadItemProps) {
    const getIcon = () => {
        if (fileType === 'image') {
            return <Image className="w-5 h-5 text-purple-600" />;
        }
        if (fileType === 'pdf') {
            return <FileText className="w-5 h-5 text-red-600" />;
        }
        return <FileIcon className="w-5 h-5 text-blue-600" />;
    };

    const getStatusIcon = () => {
        if (status === 'completed') {
            return <CheckCircle className="w-5 h-5 text-green-600" />;
        }
        if (status === 'error') {
            return <XCircle className="w-5 h-5 text-red-600" />;
        }
        if (status === 'uploading' || status === 'processing') {
            return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
        }
        return null;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getStatusText = () => {
        if (status === 'uploading') return 'Uploading...';
        if (status === 'processing') return 'Processing...';
        if (status === 'completed') return 'Completed';
        if (status === 'error') return error || 'Failed';
        return 'Pending';
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                    {getIcon()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {fileName}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {formatFileSize(fileSize)} • {fileType.toUpperCase()}
                            </p>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                            {getStatusIcon()}
                            {(status === 'pending' || status === 'error') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onRemove}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {(status === 'uploading' || status === 'processing') && (
                        <div className="mt-3">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">{progress}%</p>
                        </div>
                    )}

                    {/* Status Text */}
                    <p
                        className={`text-xs mt-2 ${status === 'completed'
                                ? 'text-green-600'
                                : status === 'error'
                                    ? 'text-red-600'
                                    : 'text-blue-600'
                            }`}
                    >
                        {getStatusText()}
                    </p>
                </div>
            </div>
        </div>
    );
}