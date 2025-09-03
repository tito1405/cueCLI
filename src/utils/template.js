// Template variable substitution utilities

export function substituteVariables(content, variables = {}) {
  if (!variables || Object.keys(variables).length === 0) {
    return content;
  }

  let result = content;
  
  // Replace {{VARIABLE}} patterns
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(pattern, value);
  }

  // Also support ${VARIABLE} syntax
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\$\\{\\s*${key}\\s*\\}`, 'g');
    result = result.replace(pattern, value);
  }

  return result;
}

export function parseVariables(varsArray) {
  if (!varsArray || !Array.isArray(varsArray)) {
    return {};
  }

  const variables = {};
  
  for (const varString of varsArray) {
    const [key, ...valueParts] = varString.split('=');
    if (key && valueParts.length > 0) {
      variables[key.trim()] = valueParts.join('=').trim();
    }
  }

  return variables;
}

export function extractVariables(content) {
  const variables = new Set();
  
  // Find {{VARIABLE}} patterns
  const curlyMatches = content.matchAll(/{{\\s*([^}]+)\\s*}}/g);
  for (const match of curlyMatches) {
    variables.add(match[1].trim());
  }

  // Find ${VARIABLE} patterns
  const dollarMatches = content.matchAll(/\\$\\{\\s*([^}]+)\\s*\\}/g);
  for (const match of dollarMatches) {
    variables.add(match[1].trim());
  }

  return Array.from(variables);
}