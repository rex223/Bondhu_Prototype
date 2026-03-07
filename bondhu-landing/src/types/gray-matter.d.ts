declare module 'gray-matter' {
  interface GrayMatterOption<
    I extends GrayMatterOption.Input,
    O extends GrayMatterOption.Output
  > {
    parser?: () => void;
    eval?: boolean;
    excerpt?: boolean | ((input: I, options: GrayMatterOption<I, O>) => string);
    excerpt_separator?: string;
    engines?: {
      [index: string]: (input: string) => object;
    };
    language?: string;
    delimiters?: string | [string, string];
  }

  namespace GrayMatterOption {
    type Input = string | Buffer;
    type Output = string | Buffer | object;
  }

  interface GrayMatterFile<I extends GrayMatterOption.Input> {
    data: { [key: string]: any };
    content: string;
    excerpt?: string;
    orig: I;
    language: string;
    matter: string;
    stringify(lang: string): string;
  }

  function matter<
    I extends GrayMatterOption.Input,
    O extends GrayMatterOption.Output
  >(
    input: I,
    options?: GrayMatterOption<I, O>
  ): GrayMatterFile<I>;

  namespace matter {
    export function read<O extends GrayMatterOption.Output>(
      fp: string,
      options?: GrayMatterOption<string, O>
    ): GrayMatterFile<string>;

    export function stringify<O extends GrayMatterOption.Output>(
      file: string | { content: string; data?: object },
      data?: object,
      options?: GrayMatterOption<string, O>
    ): string;

    export function test(str: string, options?: GrayMatterOption<string, string>): boolean;

    export const language: string;
  }

  export = matter;
}
