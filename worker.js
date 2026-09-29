export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API routes will be added here later.
    if (url.pathname.startsWith("/api/")) {
      return new Response(
        JSON.stringify({
          status: "ok",
          message: "Arpita's Oven API is running."
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Everything else continues to use the existing website.
    return env.ASSETS.fetch(request);
  }
};
