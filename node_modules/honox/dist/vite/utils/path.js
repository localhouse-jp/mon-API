function isComponentName(name) {
  return /^[A-Z][A-Z0-9]*[a-z][A-Za-z0-9]*$/.test(name);
}
function matchIslandComponentId(id, islandDir = "/islands") {
  const regExp = new RegExp(
    `^${islandDir}/.+?.tsx$|.*/(?:_[a-zA-Z0-9-]+.island.tsx$|\\$[a-zA-Z0-9-]+.tsx$)`
  );
  return id.match(regExp);
}
export {
  isComponentName,
  matchIslandComponentId
};
