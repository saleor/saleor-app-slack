import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { Response } from "retes/response";
import { gql } from "urql";

import { OrderCreatedWebhookPayloadFragment } from "../../../generated/graphql";
import { getValue } from "../../../lib/metadata";
import { saleorApp } from "../../../lib/saleor-app";
import { sendSlackMessage } from "../../../lib/slack";

const OrderCreatedWebhookPayload = gql`
  fragment OrderCreatedWebhookPayload on OrderCreated {
    order {
      id
      number
      user {
        email
        firstName
        lastName
      }
      shippingAddress {
        streetAddress1
        city
        postalCode
        country {
          country
        }
      }
      subtotal {
        gross {
          amount
          currency
        }
      }
      shippingPrice {
        gross {
          amount
          currency
        }
      }
      total {
        gross {
          amount
          currency
        }
      }
    }
  }
`;

const OrderCreatedGraphqlSubscription = gql`
  ${OrderCreatedWebhookPayload}
  subscription OrderCreated {
    event {
      ...OrderCreatedWebhookPayload
    }
  }
`;

export const orderCreatedWebhook = new SaleorAsyncWebhook<OrderCreatedWebhookPayloadFragment>({
  name: "Order Created in Saleor",
  webhookPath: "api/webhooks/order-created",
  asyncEvent: "ORDER_CREATED",
  apl: saleorApp.apl,
  subscriptionQueryAst: OrderCreatedGraphqlSubscription,
});

const handler: NextWebhookApiHandler<OrderCreatedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { payload, authData } = context;

  const webhookUrl = await getValue(authData.domain, "WEBHOOK_URL");

  if (!payload.order) {
    return Response.BadRequest({ success: false, message: "Order not found in request payload" });
  }

  const response = await sendSlackMessage(webhookUrl, {
    saleorDomain: authData.domain,
    order: payload.order,
  });

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

export default orderCreatedWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
