import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "@saleor/app-sdk/APL";

/* eslint-disable class-methods-use-this */
export class RestApl implements APL {
  async delete(domain: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async get(domain: string): Promise<AuthData | undefined> {
    throw new Error("Not implemented");
  }

  async getAll(): Promise<AuthData[]> {
    throw new Error("Not implemented");
  }

  async isConfigured(): Promise<AplConfiguredResult> {
    return process.env.REST_APL_ENDPOINT
      ? {
          configured: true,
        }
      : {
          configured: false,
          error: new Error("REST_APL_ENDPOINT env variable is missing"),
        };
  }

  async isReady(): Promise<AplReadyResult> {
    return process.env.REST_APL_ENDPOINT
      ? {
          ready: true,
        }
      : {
          ready: false,
          error: new Error("REST_APL_ENDPOINT env variable is missing"),
        };
  }

  async set(authData: AuthData): Promise<void> {
    throw new Error("Not implemented");
  }
}
