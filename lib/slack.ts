export const sendSlackMessage = async (
  to: string,
  data: { userEmail: string; saleorDomain: string; orderId: string }
) => {
  const { userEmail, saleorDomain, orderId } = data;

  const response = await fetch(to, {
    method: "POST",
    body: JSON.stringify({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `New order created for ${userEmail} 🎉\n\n<https://${saleorDomain}/dashboard/orders/${orderId}|View order>`,
          },
        },
      ],
    }),
  });

  return response;
};
