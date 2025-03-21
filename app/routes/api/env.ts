import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getEvent } from "vinxi/http";

export const Route = createAPIFileRoute("/api/env")({
  GET: async () => {
    const event = getEvent();

    // NEVER DO THIS IN YOUR APP, THIS IS JUST FOR THE EXAMPLE
    return json(event.context.cloudflare.env);
  },
});
