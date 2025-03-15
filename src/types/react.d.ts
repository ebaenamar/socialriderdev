declare module 'react' {
  export interface CSSProperties {
    [key: string]: unknown;
  }
  
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useState<T = undefined>(): [T | undefined, (newState: T | ((prevState: T | undefined) => T)) => void];
}

declare module 'react/jsx-runtime' {
  export default unknown;
  export const jsx: unknown;
  export const jsxs: unknown;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}
