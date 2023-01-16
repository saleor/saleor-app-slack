import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";

import { saleorApp } from "../../lib/saleor-app";

const handler = createAppRegisterHandler(saleorApp);

export default handler;
