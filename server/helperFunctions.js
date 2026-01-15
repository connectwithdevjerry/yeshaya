const pdf = require("pdf-parse-new");
const mammoth = require("mammoth");
const sanitizeHtml = require("sanitize-html");

const extractText = async (file) => {
  const { mimetype, buffer, originalname } = file;

  console.log(
    `Extracting text from file: ${originalname} with mimetype: ${mimetype}`
  );

  if (mimetype === "application/pdf") {
    console.log("Processing PDF file");
    const parsePdf = typeof pdf === "function" ? pdf : pdf.default;
    const data = await parsePdf(buffer);

    const cleanText = sanitizeHtml(data.text, {
      allowedTags: [], // Remove ALL tags, leaving only text
      allowedAttributes: {}, // Remove ALL attributes
      // Ensure the content inside these tags is also deleted
      nonTextTags: ["style", "script", "noscript"],
    });

    // console.log(`Extracted text: ${cleanText}`);
    return cleanText;
  }

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimetype.startsWith("text/")) {
    return buffer.toString("utf-8");
  }

  throw new Error(`Unsupported file type: ${originalname}`);
};

const extractVariables = (template) => {
  const regex = /{{\s*([^}]+)\s*}}/g;
  const variables = new Set();
  let match;

  while ((match = regex.exec(template)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
};

const fillTemplate = (template, values) => {
  return template.replace(/{{\s*([^}]+)\s*}}/g, (match, key) => {
    if (!(key in values)) {
      throw new Error(`Missing value for variable: ${key}`);
    }
    return values[key];
  });
};

module.exports = { extractText, fillTemplate, extractVariables };
