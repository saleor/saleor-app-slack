import { SaleorApp } from "@saleor/app-sdk";
import { UpstashAPL, VercelAPL } from "@saleor/app-sdk/APL";

const isVercel = process.env.VERCEL === "1";

/**
 * For local development store auth data in the Upstash (see docs/upstash.md for more).
 * For app deployment on Vercel with Saleor CLI, use vercelAPL.
 *
 * To read more about storing auth data, read the
 * [APL documentation](https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md)
 */
const apl = isVercel
  ? new VercelAPL()
  : new UpstashAPL({
      restToken: process.env.NEXT_PUBLIC_UPSTASH_TOKEN,
      restURL: process.env.NEXT_PUBLIC_UPSTASH_URL,
    });

export const saleorApp = new SaleorApp({
  apl,
});
