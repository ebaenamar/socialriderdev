declare module 'react-infinite-scroll-component' {
  import { ComponentType, ReactNode } from 'react';

  interface InfiniteScrollProps {
    dataLength: number;
    next: () => void;
    hasMore: boolean;
    loader?: ReactNode;
    endMessage?: ReactNode;
    className?: string;
    height?: string | number;
    scrollThreshold?: string | number;
    style?: React.CSSProperties;
    inverse?: boolean;
    scrollableTarget?: string;
    initialScrollY?: number;
    children?: ReactNode;
  }

  const InfiniteScroll: ComponentType<InfiniteScrollProps>;
  export default InfiniteScroll;
}
