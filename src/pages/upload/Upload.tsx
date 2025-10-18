import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FileUploadZone from '../../components/upload/FileUploadZone';
import FileUploadItem from '../../components/upload/FileUploadItem';
import SubjectSelector from '../../components/upload/SubjectSelector';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Upload as UploadIcon, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { extractTextFromFile, getFileType } from '../../lib/fileProcessors';

interface FileWithMetadata {
    file: File;
    id: string;
    status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
    progress: number;
    error?: string;
    extractedText?: string;
}

export default function Upload() {
    const [files, setFiles] = useState<FileWithMetadata[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedSubjectName, setSelectedSubjectName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const handleFilesSelected = (newFiles: File[]) => {
        const filesWithMetadata: FileWithMetadata[] = newFiles.map((file) => ({
            file,
            id: Math.random().toString(36).substring(7),
            status: 'pending',
            progress: 0,
        }));

        setFiles((prev) => [...prev, ...filesWithMetadata]);
    };

    const handleRemoveFile = (fileId: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
    };

    function normalizeName(name: string) {
        return name
            .trim()                       // remove leading/trailing spaces
            .toLowerCase()                // lowercase
            .replace(/\s+/g, '_');        // replace one or more spaces with underscore
    }

    // function emailToDirName(email: string | undefined) {
    //     if (typeof email !== 'string') {
    //         throw new TypeError('Expected a string');
    //     }
    //     // Basic sanitize: map @ and . to underscore, lowercase
    //     let s = email
    //         .trim()
    //         .toLowerCase()
    //         .replace(/@/g, '_')
    //         .replace(/\./g, '_');

    //     // Remove any characters that are not alphanumeric or underscore or hyphen (you can adjust)
    //     // (so you avoid characters invalid in filenames)
    //     s = s.replace(/[^a-z0-9_-]/g, '');

    //     // Optionally: collapse multiple underscores into one
    //     s = s.replace(/_+/g, '_');

    //     // Optionally: trim leading/trailing underscores
    //     s = s.replace(/^_+|_+$/g, '');

    //     return s;
    // }

    const uploadFile = async (fileWithMetadata: FileWithMetadata) => {
        const { file, id } = fileWithMetadata;

        try {
            // Update status to uploading
            setFiles((prev) =>
                prev.map((f) => (f.id === id ? { ...f, status: 'uploading', progress: 10 } : f))
            );

            // Upload to Supabase Storage
            const fileName = `${user!.id}/${normalizeName(selectedSubjectName)}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('study-materials')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Update progress
            setFiles((prev) =>
                prev.map((f) => (f.id === id ? { ...f, progress: 50 } : f))
            );

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('study-materials')
                .getPublicUrl(fileName);

            // Update status to processing (extracting text)
            setFiles((prev) =>
                prev.map((f) => (f.id === id ? { ...f, status: 'processing', progress: 60 } : f))
            );

            // Extract text from file
            let extractedText = '';
            try {
                extractedText = await extractTextFromFile(file, (progress) => {
                    setFiles((prev) =>
                        prev.map((f) =>
                            f.id === id ? { ...f, progress: 60 + (progress * 0.3) } : f
                        )
                    );
                });
            } catch (extractError) {
                console.error('Text extraction failed:', extractError);
                // Continue even if extraction fails
            }

            // Update progress
            setFiles((prev) =>
                prev.map((f) => (f.id === id ? { ...f, progress: 90 } : f))
            );

            // Save metadata to database
            const { error: dbError } = await supabase.from('materials').insert({
                user_id: user!.id,
                subject_id: selectedSubjectId,
                file_name: file.name,
                file_type: getFileType(file),
                file_size: file.size,
                file_url: urlData.publicUrl,
                extracted_text: extractedText || null,
                is_analyzed: false,
            });

            if (dbError) throw dbError;

            // Update to completed
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === id
                        ? { ...f, status: 'completed', progress: 100, extractedText }
                        : f
                )
            );
        } catch (err) {
            console.error('Upload error:', err);
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === id
                        ? { ...f, status: 'error', error: err instanceof Error ? err.message : 'Upload failed' }
                        : f
                )
            );
        }
    };

    const handleUploadAll = async () => {
        if (!selectedSubjectId) {
            setError('Please select a subject first');
            return;
        }

        if (files.length === 0) {
            setError('Please select files to upload');
            return;
        }

        setError('');
        setUploading(true);

        const pendingFiles = files.filter((f) => f.status === 'pending');

        // Upload files sequentially
        for (const file of pendingFiles) {
            await uploadFile(file);
        }

        setUploading(false);
    };

    const handleClearCompleted = () => {
        setFiles((prev) => prev.filter((f) => f.status !== 'completed'));
    };

    const pendingCount = files.filter((f) => f.status === 'pending').length;
    const completedCount = files.filter((f) => f.status === 'completed').length;
    const errorCount = files.filter((f) => f.status === 'error').length;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Upload Materials</h1>
                    <p className="text-gray-600 mt-1">
                        Upload your study materials to analyze and generate quizzes
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Subject Selector */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <SubjectSelector
                        selectedSubjectId={selectedSubjectId}
                        setSelectedSubjectName={setSelectedSubjectName}
                        onSubjectChange={setSelectedSubjectId}
                    />
                </div>

                {/* Upload Zone */}
                {selectedSubjectId && (
                    <FileUploadZone
                        onFilesSelected={handleFilesSelected}
                        disabled={uploading}
                    />
                )}

                {/* File List */}
                {files.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Files ({files.length})
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {pendingCount > 0 && `${pendingCount} pending`}
                                    {completedCount > 0 && ` • ${completedCount} completed`}
                                    {errorCount > 0 && ` • ${errorCount} failed`}
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                {completedCount > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearCompleted}
                                        disabled={uploading}
                                    >
                                        Clear Completed
                                    </Button>
                                )}
                                {pendingCount > 0 && (
                                    <Button
                                        onClick={handleUploadAll}
                                        disabled={uploading || !selectedSubjectId}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <UploadIcon className="w-4 h-4 mr-2" />
                                        Upload {pendingCount} {pendingCount === 1 ? 'File' : 'Files'}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {files.map((fileWithMetadata) => (
                                <FileUploadItem
                                    key={fileWithMetadata.id}
                                    fileName={fileWithMetadata.file.name}
                                    fileSize={fileWithMetadata.file.size}
                                    fileType={getFileType(fileWithMetadata.file)}
                                    status={fileWithMetadata.status}
                                    progress={fileWithMetadata.progress}
                                    error={fileWithMetadata.error}
                                    onRemove={() => handleRemoveFile(fileWithMetadata.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Info Box */}
                {files.length === 0 && selectedSubjectId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-medium text-blue-900 mb-2">
                            Upload Tips
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>Upload class notes, textbook pages, or lecture slides</li>
                            <li>Supported formats: PDF, DOCX, PPTX, images, and text files</li>
                            <li>We'll automatically extract text and analyze your materials</li>
                            <li>Higher quality scans work best for images</li>
                            <li>You can upload multiple files at once</li>
                        </ul>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}