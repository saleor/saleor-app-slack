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

const handler: Handler = async (request) => {
  const saleorDomain = request.headers[SALEOR_DOMAIN_HEADER];
  const webhookUrl = await getValue(saleorDomain as string, "WEBHOOK_URL");

  const context = request.params;
  const {
    order: { id, userEmail },
  } = context;

  if (!id) {
    return Response.BadRequest({ success: false, message: "No order id." });
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    body: JSON.stringify({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `New order created for ${userEmail} 🎉\n\n<https://${saleorDomain}/dashboard/orders/${id}|View order>`,
          },
        },
      ],
    }),
  });

  if (response.status !== 200) {
    return Response.InternalServerError({
      success: true,
      message: `Slack API responded with status ${
        response.status
      }. Message: ${await response.text()}`,
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
