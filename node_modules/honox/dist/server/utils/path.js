const ensureTrailngSlash = (path) => {
  return path.endsWith("/") ? path : path + "/";
};
export {
  ensureTrailngSlash
};
