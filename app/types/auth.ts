import "next-auth";

declare module "next-auth" {
  interface User {
    id?: number;
  }

  export interface Session {
    user: User;
  }
}
