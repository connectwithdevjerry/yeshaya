import toast from "react-hot-toast";

const copyTextToClipboard = (text) => {
  if (typeof text !== "string") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";

  document.body.appendChild(textarea);
  textarea.select();

  let successful = false;
  try {
    successful = document.execCommand("copy");
    if (successful) {
      toast.success("Copied to clipboard!");
    } else {
      toast.error("Failed to copy!");
    }
  } catch (err) {
    toast.error("Failed to copy!");
    successful = false;
  }

  document.body.removeChild(textarea);

  return successful;
};

export { copyTextToClipboard };
