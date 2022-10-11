import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  TextField,
  Typography,
} from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import { ConfirmButton, ConfirmButtonTransitionState, makeStyles } from "@saleor/macaw-ui";
import { ChangeEvent, ReactElement, SyntheticEvent, useEffect, useState } from "react";

import useAppApi from "../hooks/useAppApi";
import useDashboardNotifier from "../utils/useDashboardNotifier";

interface ConfigurationField {
  key: string;
  value: string;
}

const useStyles = makeStyles((theme) => ({
  confirmButton: {
    marginLeft: "auto",
  },
  fieldContainer: {
    marginBottom: theme.spacing(2),
  },
}));

function Configuration() {
  const classes = useStyles();
  const { appBridgeState } = useAppBridge();
  const [notify] = useDashboardNotifier();
  const [configuration, setConfiguration] = useState<ConfigurationField[]>();
  const [transitionState, setTransitionState] = useState<ConfirmButtonTransitionState>("default");

  const { data: configurationData, error } = useAppApi<{ data: ConfigurationField[] }>({
    url: "/api/configuration",
  });

  useEffect(() => {
    if (configurationData && !configuration) {
      setConfiguration(configurationData.data);
    }
  }, [configurationData, configuration]);

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    setTransitionState("loading");

    fetch("/api/configuration", {
      method: "POST",
      headers: [
        ["content-type", "application/json"],
        [SALEOR_DOMAIN_HEADER, appBridgeState?.domain!],
        [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
      ],
      body: JSON.stringify({ data: configuration }),
    })
      .then(async (response) => {
        setTransitionState(response.status === 200 ? "success" : "error");
        await notify({
          status: "success",
          title: "Success",
          text: "Configuration updated successfully",
        });
      })
      .catch(async () => {
        setTransitionState("error");
        await notify({
          status: "error",
          title: "Configuration update failed",
        });
      });
  };

  const onChange = (event: ChangeEvent) => {
    const { name, value } = event.target as HTMLInputElement;
    setConfiguration((prev) =>
      prev!.map((prevField) => (prevField.key === name ? { ...prevField, value } : prevField))
    );
  };

  useEffect(() => {
    if (error) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      notify({
        status: "error",
        title: "Something went wrong!",
        text: "Couldn't fetch configuration data",
      });
    }
  }, [error]);

  if (configuration === undefined) {
    return <Skeleton />;
  }

  return (
    <form onSubmit={handleSubmit}>
      {configuration!.map(({ key, value }) => (
        <div key={key} className={classes.fieldContainer}>
          <TextField label={key} name={key} fullWidth onChange={onChange} value={value} />
        </div>
      ))}
      <div>
        <ConfirmButton
          type="submit"
          variant="primary"
          transitionState={transitionState}
          labels={{
            confirm: "Save",
            error: "Error",
          }}
          className={classes.confirmButton}
        />
      </div>
    </form>
  );
}

function Instructions() {
  const { appBridge } = useAppBridge();

  const { data } = useAppApi({
    url: "/api/slack-app-manifest",
  });

  const slackUrl = new URL("https://api.slack.com/apps");
  slackUrl.searchParams.append("new_app", "1");
  slackUrl.searchParams.append("manifest_json", JSON.stringify(data));

  return (
    <>
      <Typography>How to configure</Typography>
      <List>
        <ListItem>
          <a
            onClick={(e) => {
              e.preventDefault();
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              appBridge?.dispatch({
                type: "redirect",
                payload: {
                  newContext: true,
                  actionId: "redirect_from_slack_app",
                  to: slackUrl.href,
                },
              });
            }}
            href={slackUrl.href}
          >
            Install Slack application
          </a>
        </ListItem>
        <ListItem>
          Copy incoming Webhook URL from Slack app configuration and paste it below into
          `WEBHOOK_URL` field
        </ListItem>
        <ListItem>Save configuration</ListItem>
      </List>
    </>
  );
}

Configuration.getLayout = (page: ReactElement) => (
  <div>
    <Card style={{ marginBottom: 40 }}>
      <CardHeader title="Instructions" />
      <CardContent>
        <Instructions />
      </CardContent>
    </Card>
    <Card>
      <CardHeader title="Configuration" />
      <CardContent>{page}</CardContent>
    </Card>
  </div>
);

export default Configuration;
