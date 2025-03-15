declare module 'googleapis' {
  export const google: {
    youtube: (version: string) => {
      search: {
        list: (params: unknown) => Promise<{
          data: {
            items: Array<{
              id?: { videoId?: string };
              snippet?: { title?: string; description?: string };
            }>;
            nextPageToken?: string;
          };
        }>;
      };
      videos: {
        list: (params: unknown) => Promise<{
          data: {
            items: Array<{
              snippet?: { description?: string };
            }>;
          };
        }>;
      };
    };
  };
}
