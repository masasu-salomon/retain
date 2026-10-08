/**
 * Validates request parts against zod schemas.
 * Parsed (and coerced) values are exposed on `req.valid.{body,query,params}`
 * because Express 5 makes `req.query` read-only.
 */
export const validate = (schemas) => (req, _res, next) => {
  req.valid = req.valid ?? {};
  for (const part of ['params', 'query', 'body']) {
    if (schemas[part]) {
      req.valid[part] = schemas[part].parse(req[part] ?? {});
    }
  }
  next();
};
