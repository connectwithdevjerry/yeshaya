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

module.exports = {
  extractVariables,
  fillTemplate,
};
