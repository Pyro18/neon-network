"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, ImageIcon, FileText, Film, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
}

export function MediaUploader() {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (fileList: FileList) => {
    setIsUploading(true)

    // Simula l'upload dei file
    // Nel sito reale, qui dovresti inviare i file al server
    // e gestire la risposta del server
    setTimeout(() => {
      const newFiles: UploadedFile[] = []

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        newFiles.push({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
        })
      }

      setFiles([...files, ...newFiles])
      setIsUploading(false)
    }, 1500)
  }

  const removeFile = (id: string) => {
    setFiles(files.filter((file) => file.id !== id))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5" />
    if (type.startsWith("video/")) return <Film className="h-5 w-5" />
    if (type.startsWith("audio/")) return <Music className="h-5 w-5" />
    return <FileText className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center",
          isDragging ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/50",
          "transition-colors duration-200",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-background/30 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">Drag and drop files here</p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports images, videos, and other media files up to 10MB
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="bg-background/30"
          >
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
            accept="image/*,video/*,audio/*"
          />
        </div>
      </div>

      {isUploading && (
        <div className="p-4 bg-background/30 rounded-lg">
          <div className="flex items-center">
            <div className="w-full">
              <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse rounded-full w-2/3"></div>
              </div>
            </div>
            <span className="ml-4 text-sm text-muted-foreground">Uploading...</span>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Uploaded Files</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-3 rounded-lg border border-border/30 bg-background/20 backdrop-blur-sm flex items-center"
              >
                <div className="h-10 w-10 rounded bg-background/30 flex items-center justify-center mr-3">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <p>Allowed file types: Images (PNG, JPG, GIF), Videos (MP4, WebM), Audio (MP3, WAV)</p>
        <p>Maximum file size: 10MB</p>
      </div>
    </div>
  )
}
