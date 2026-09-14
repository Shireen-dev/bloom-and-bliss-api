// Returns an array of missing/invalid field names, or [] if the body is valid.
function requireFields(body, fields) {
  const missing = [];
  fields.forEach((field) => {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      missing.push(field);
    }
  });
  return missing;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_RE.test(email);
}

module.exports = { requireFields, isValidEmail };
