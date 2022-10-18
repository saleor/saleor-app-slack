import { SaleorApp } from "@saleor/app-sdk";
import { FileAPL, UpstashAPL, VercelAPL } from "@saleor/app-sdk/APL";

const mapping = {
  FileAPL: new FileAPL(),
  VercelAPL: new VercelAPL(),
  UpstashAPL: new UpstashAPL(),
};

export const saleorApp = new SaleorApp({
  apl: mapping[process.env.APL_ENV],
});
