/** JSX */
type CreateElement = (type: any, props: any) => Node | Promise<Node>;
type Hydrate = (children: Node, parent: Element) => void | Promise<void>;
type CreateChildren = (childNodes: NodeListOf<ChildNode>) => Node[] | Promise<Node[]>;
type HydrateComponent = (doc: {
    querySelectorAll: typeof document.querySelectorAll;
}) => Promise<void>;
type TriggerHydration = (trigger: HydrateComponent) => void;

export type { CreateChildren, CreateElement, Hydrate, HydrateComponent, TriggerHydration };
