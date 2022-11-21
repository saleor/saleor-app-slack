import { APL, FileAPL, RestAPL, UpstashAPL, VercelAPL } from "@saleor/app-sdk/APL";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

/**
 * By default, auth data are stored in the `.auth-data.json` (FileAPL).
 * For multi-tenant applications and deployments please use UpstashAPL.
 *
 * To read more about storing auth data, read the
 * [APL documentation](https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md)
 */

let apl: APL;
switch (process.env.APL) {
  case "vercel":
    apl = new VercelAPL();
    break;
  case "upstash":
    // Require `UPSTASH_URL` and `UPSTASH_TOKEN` environment variables
    apl = new UpstashAPL();
    break;
  case "REST": {
    apl = new RestAPL({
      resourceUrl: process.env.REST_APL_ENDPOINT as string,
      headers: {
        Authorization: `Bearer ${process.env.REST_APL_TOKEN as string}`,
      },
    });
    break;
  }
  default:
    apl = new FileAPL();
}

export const saleorApp = new SaleorApp({
  apl,
});
