import React from 'react';
import { DownloadIcon } from 'lucide-react';

interface DownloadTxtButtonProps {
  reportText: string;
  fileName?: string;
}

const DownloadTxtButton: React.FC<DownloadTxtButtonProps> = ({
  reportText,
  fileName = 'research_report.txt',
}) => {
  const handleDownload = () => {
    // Create a blob from the report text content.
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    // Create a temporary URL for the blob.
    const url = window.URL.createObjectURL(blob);
    // Create a temporary anchor element.
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    // Append the link, trigger click, remove it, and revoke the URL.
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="
        group
        relative
        flex
        items-center
        justify-center
        gap-2
        px-4
        py-2
        bg-background/50
        hover:bg-muted/30
        border-[0.5px]
        border-border/40
        hover:border-border/60
        rounded-lg
        text-sm
        font-medium
        text-muted-foreground
        hover:text-foreground
        shadow-[0_1px_3px_0_rgb(0,0,0,0.02)]
        hover:shadow-[0_2px_4px_0_rgb(0,0,0,0.02)]
        transition-all
        duration-300
        ease-out
        backdrop-blur-[2px]
        hover:translate-y-[-1px]
      "
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/5 to-muted/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
      <DownloadIcon className="w-4 h-4" />
      <span>Download Report</span>
    </button>
  );
};

export default DownloadTxtButton;
