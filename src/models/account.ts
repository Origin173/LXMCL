// player
export interface Player {
  name: string;
  uuid: string;
  avatarUrl: string;
  serverType: "offline" | "3rdparty";
  authServer?: AuthServer; // only from authlib-injector
  authAccount?: string; // only from authlib-injector
  password?: string; // only from authlib-injector
}

// authlib-injector source
export interface AuthServer {
  // id: number;
  name: string;
  authUrl: string;
}
