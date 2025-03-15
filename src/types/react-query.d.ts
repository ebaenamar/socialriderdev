declare module '@tanstack/react-query' {
  export interface QueryOptions<TData = unknown> {
    queryKey: unknown[];
    queryFn: (context: { pageParam?: string }) => Promise<TData>;
    getNextPageParam?: (lastPage: unknown) => unknown;
    initialPageParam?: string;
  }

  export interface InfiniteQueryResult<TData = unknown, TError = unknown> {
    data?: {
      pages: TData[];
    };
    fetchNextPage: () => Promise<unknown>;
    hasNextPage: boolean | undefined;
    isLoading: boolean;
    isError: boolean;
    error?: TError;
  }

  export function useInfiniteQuery<TData = unknown, TError = unknown, TPageParam = unknown>(
    options: {
      queryKey: unknown[];
      queryFn: (context: { pageParam?: string }) => Promise<TData>;
      getNextPageParam?: (lastPage: TData) => TPageParam;
      initialPageParam?: string;
    }
  ): InfiniteQueryResult<TData, TError>;

}
