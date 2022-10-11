import { withBaseURL } from "@saleor/app-sdk/middleware";
import { withSentry } from "@sentry/nextjs";
import type { Handler } from "retes";
import { toNextHandler } from "retes/adapter";
import { Response } from "retes/response";

const handler: Handler = () => {
  const manifest = {
    display_information: {
      name: "Saleor bot",
    },
    features: {
      bot_user: {
        display_name: "Saleor bot",
        always_online: false,
      },
    },
    oauth_config: {
      scopes: {
        bot: ["incoming-webhook"],
      },
    },
    settings: {
      org_deploy_enabled: false,
      socket_mode_enabled: false,
      token_rotation_enabled: false,
    },
  };

  return Response.OK(manifest);
};

export default withSentry(toNextHandler([withBaseURL, handler]));
