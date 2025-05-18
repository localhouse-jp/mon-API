/**
 * Check if the name is a valid component name
 *
 * @param name - The name to check
 * @returns true if the name is a valid component name
 * @example
 * isComponentName('Badge') // true
 * isComponentName('BadgeComponent') // true
 * isComponentName('badge') // false
 * isComponentName('MIN') // false
 * isComponentName('Badge_Component') // false
 */
declare function isComponentName(name: string): boolean;
/**
 * Matches when id is the filename of Island component
 *
 * @param id - The id to match
 * @returns The result object if id is matched or null
 */
declare function matchIslandComponentId(id: string, islandDir?: string): RegExpMatchArray | null;

export { isComponentName, matchIslandComponentId };
