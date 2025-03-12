import { message, notification, Button } from "antd";

export const handleFileDownload = (receivedData) => {
  if (!receivedData || !receivedData.file) {
    message.error("Invalid file data received");
    return;
  }

  try {
    // Show notification with download option
    notification.open({
      message: "File Received",
      description: `${receivedData.fileName} (${(
        receivedData.file.byteLength / 1024
      ).toFixed(2)} KB)`,
      duration: 0, // Won't auto-close
      btn: (
        <Button
          type="primary"
          onClick={() => {
            try {
              // Convert ArrayBuffer to Blob
              const blob = new Blob(
                [
                  receivedData.file instanceof ArrayBuffer
                    ? receivedData.file
                    : new Uint8Array(receivedData.file),
                ],
                { type: receivedData.fileType || "application/octet-stream" }
              );

              // Create download URL
              const url = URL.createObjectURL(blob);

              // Create and configure download link
              const a = document.createElement("a");
              a.href = url;
              a.download = receivedData.fileName || "downloaded_file";

              // Add to DOM, click, and remove
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);

              // Cleanup
              URL.revokeObjectURL(url);

              message.success(`Downloading ${receivedData.fileName}`);
              notification.close(receivedData.fileName); // Close the notification
            } catch (error) {
              console.error("Download error:", error);
              message.error(`Failed to download file: ${error.message}`);
            }
          }}
        >
          Download
        </Button>
      ),
      key: receivedData.fileName, // Use filename as key to prevent duplicate notifications
      onClose: () => {
        // Optional: Handle notification close
        console.log("User dismissed file download notification");
      },
    });
  } catch (error) {
    console.error("File handling error:", error);
    message.error(`Failed to process file: ${error.message}`);
  }
};
