import { SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import {
  withRegisteredSaleorDomainHeader,
  withSaleorEventMatch,
  withWebhookSignatureVerified,
} from "@saleor/app-sdk/middleware";
import { withSentry } from "@sentry/nextjs";
import { Handler } from "retes";
import { toNextHandler } from "retes/adapter";
import { Response } from "retes/response";

import { getValue } from "../../../lib/metadata";
import { apl } from "../../../lib/saleorApp";
import { sendSlackMessage } from "../../../lib/slack";

const handler: Handler = async (request) => {
  const saleorDomain = request.headers[SALEOR_DOMAIN_HEADER] as string;
  const webhookUrl = await getValue(saleorDomain, "WEBHOOK_URL");

  const context = request.params;
  const {
    order: { id, userEmail },
  } = context;

  if (!id) {
    return Response.BadRequest({ success: false, message: "No order id." });
  }

  const response = await sendSlackMessage(webhookUrl, { userEmail, saleorDomain, orderId: id });

  if (response.status !== 200) {
    const errorMessage = await response.text();
    console.error(`Slack API responded with code ${response.status}: ${errorMessage}`);

    return Response.InternalServerError({
      success: false,
      message: `Slack API responded with status ${response.status}. Message: ${errorMessage}`,
    });
  }

  return Response.OK({ success: true, message: "Slack message sent!" });
};

export default withSentry(
  toNextHandler([
    withRegisteredSaleorDomainHeader({ apl }),
    withSaleorEventMatch("order_created"),
    withWebhookSignatureVerified(),
    handler,
  ])
);

export const config = {
  api: {
    bodyParser: false,
  },
};
