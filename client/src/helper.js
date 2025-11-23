const copyTextToClipboard = (text) => {
  // 1. Input validation (optional, but good practice)
  if (typeof text !== "string") return false;

  // 2. Create and configure a temporary textarea element
  const textarea = document.createElement("textarea");
  textarea.value = text;

  // Position off-screen so the user doesn't see it
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";

  // 3. Append to body, select text, and execute command
  document.body.appendChild(textarea);
  textarea.select();

  let successful = false;
  try {
    // This is the core method that puts the text into the clipboard
    successful = document.execCommand("copy");
  } catch (err) {
    // Handle failure if the command is disallowed
    successful = false;
  }

  // 4. Clean up
  document.body.removeChild(textarea);

  return successful;
};

export { copyTextToClipboard };