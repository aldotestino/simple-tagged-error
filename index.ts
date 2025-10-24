export function TaggedError<Tag extends string>(tag: Tag) {
  // biome-ignore lint/complexity/noBannedTypes: We need to use {} as a type to allow for optional properties
  return class<T extends object = {}> extends Error {
    readonly _tag: Tag = tag;

    constructor(props?: T) {
      super(tag);
      Object.setPrototypeOf(this, new.target.prototype);
      if (props) {
        Object.assign(this, props);
      }
      this.name = tag;
    }
    // biome-ignore lint/complexity/noBannedTypes: We need to use {} as a type to allow for optional properties
  } as new <T extends object = {}>(
    props?: T
  ) => Error & T & { readonly _tag: Tag };
}
