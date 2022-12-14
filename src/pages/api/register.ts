import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { withSentry } from "@sentry/nextjs";

import { saleorApp } from "../../lib/saleor-app";

const handler = createAppRegisterHandler(saleorApp);

export default withSentry(handler);
