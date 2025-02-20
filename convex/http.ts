import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";

const http = httpRouter();
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET env variable");
    }
    const swix_id = req.headers.get("svix-id");
    const swix_signature = req.headers.get("svix-signature");
    const swix_timestamp = req.headers.get("svix-timestamp");

    if (!swix_id || !swix_signature || !swix_timestamp) {
      return new Response("No swix headers found", { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let event: WebhookEvent;

    try {
      event = wh.verify(body, {
        "svix-id": swix_id,
        "svix-signature": swix_signature,
        "svix-timestamp": swix_timestamp,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook", err);
      return new Response("Error occurred", { status: 400 });
    }

    const eventType = event.type;
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        event.data;
      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, {
          clerkId: id,
          email,
          name,
          image: image_url,
        });
      } catch (err) {
        console.error("Error creating user: ", err);
        return new Response("Error creating user", { status: 500 });
      }
    }
    return new Response("Webhook processed succesfully", { status: 200 });
  }),
});
