declare module 'react' {
  export * from 'react';
  export interface CSSProperties {
    [key: string]: any;
  }
}

declare module 'react/jsx-runtime' {
  export default any;
  export const jsx: any;
  export const jsxs: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
