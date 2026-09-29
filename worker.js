// Arpita's Oven admin deployment test
const ADMIN_USERNAME = "arpitasovenadmin";
const SESSION_COOKIE = "ao_admin_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000;


/* =========================
   RESPONSE HELPERS
   ========================= */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}


/* =========================
   COOKIE HELPERS
   ========================= */

function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}


function sessionCookie(id) {
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(id)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
    `Max-Age=${Math.floor(SESSION_DURATION / 1000)}`
  ].join("; ");
}


function clearSessionCookie() {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
    "Max-Age=0"
  ].join("; ");
}


/* =========================
   SESSION
   ========================= */

async function createSession(env) {

  const id = crypto.randomUUID();

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION
  ).toISOString();

  await env.DB.prepare(`
    INSERT INTO admin_sessions
    (id, expires_at)
    VALUES (?, ?)
  `)
    .bind(id, expiresAt)
    .run();

  return {
    id,
    expiresAt
  };
}


async function isLoggedIn(request, env) {

  const sessionId =
    getCookie(request, SESSION_COOKIE);

  if (!sessionId) {
    return false;
  }

  const session =
    await env.DB.prepare(`
      SELECT id
      FROM admin_sessions
      WHERE id = ?
      AND expires_at > datetime('now')
      LIMIT 1
    `)
      .bind(sessionId)
      .first();

  return !!session;
}


async function requireLogin(request, env) {

  return await isLoggedIn(request, env);

}


/* =========================
   LOGIN
   ========================= */

async function handleLogin(request, env) {

  let body;

  try {

    body = await request.json();

  } catch {

    return json({
      success: false,
      message: "Invalid request."
    }, 400);

  }


  const username =
    String(body.username || "").trim();

  const password =
    String(body.password || "");


  /*
   * IMPORTANT:
   *
   * Username comes from ADMIN_USERNAME above.
   *
   * Password comes from the Cloudflare Secret:
   *
   * ADMIN_PASSWORD
   */

  if (
    username !== ADMIN_USERNAME ||
    password !== env.ADMIN_PASSWORD
  ) {

    return json({
      success: false,
      message: "Invalid username or password."
    }, 401);

  }


  const session =
    await createSession(env);


  return new Response(
    JSON.stringify({
      success: true
    }),
    {
      status: 200,

      headers: {
        "Content-Type":
          "application/json; charset=utf-8",

        "Set-Cookie":
          sessionCookie(session.id)
      }
    }
  );

}


/* =========================
   LOGOUT
   ========================= */

async function handleLogout(request, env) {

  const sessionId =
    getCookie(request, SESSION_COOKIE);


  if (sessionId) {

    await env.DB.prepare(`
      DELETE FROM admin_sessions
      WHERE id = ?
    `)
      .bind(sessionId)
      .run();

  }


  return new Response(
    JSON.stringify({
      success: true
    }),
    {
      status: 200,

      headers: {
        "Content-Type":
          "application/json; charset=utf-8",

        "Set-Cookie":
          clearSessionCookie()
      }
    }
  );

}


/* =========================
   CHECK LOGIN
   ========================= */

async function handleMe(request, env) {

  const loggedIn =
    await isLoggedIn(request, env);


  return json({
    loggedIn
  });

}


/* =========================
   GET CAKES
   ========================= */

async function getCakes(request, env) {

  if (!(await requireLogin(request, env))) {

    return json({
      success: false,
      message: "Not authorized."
    }, 401);

  }


  const result =
    await env.DB.prepare(`
      SELECT
        id,
        name,
        description,
        price,
        category,
        image_url,
        available,
        display_order,
        created_at
      FROM cakes
      ORDER BY display_order ASC, id ASC
    `)
      .all();


  return json({
    success: true,
    cakes: result.results || []
  });

}


/* =========================
   ADD CAKE
   ========================= */

async function addCake(request, env) {

  if (!(await requireLogin(request, env))) {

    return json({
      success: false,
      message: "Not authorized."
    }, 401);

  }


  let body;

  try {

    body = await request.json();

  } catch {

    return json({
      success: false,
      message: "Invalid request."
    }, 400);

  }


  const name =
    String(body.name || "").trim();

  const description =
    String(body.description || "").trim();

  const price =
    String(body.price || "").trim();

  const category =
    String(body.category || "").trim();

  const imageUrl =
    String(body.image_url || "").trim();

  const displayOrder =
    Number(body.display_order || 0);

  const available =
    body.available === false ? 0 : 1;


  if (!name) {

    return json({
      success: false,
      message: "Cake name is required."
    }, 400);

  }


  const result =
    await env.DB.prepare(`
      INSERT INTO cakes
      (
        name,
        description,
        price,
        category,
        image_url,
        available,
        display_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        name,
        description,
        price,
        category,
        imageUrl,
        available,
        displayOrder
      )
      .run();


  return json({
    success: true,
    id: result.meta?.last_row_id || null
  });

}


/* =========================
   UPDATE CAKE
   ========================= */

async function updateCake(
  request,
  env,
  id
) {

  if (!(await requireLogin(request, env))) {

    return json({
      success: false,
      message: "Not authorized."
    }, 401);

  }


  let body;

  try {

    body = await request.json();

  } catch {

    return json({
      success: false,
      message: "Invalid request."
    }, 400);

  }


  const name =
    String(body.name || "").trim();

  const description =
    String(body.description || "").trim();

  const price =
    String(body.price || "").trim();

  const category =
    String(body.category || "").trim();

  const imageUrl =
    String(body.image_url || "").trim();

  const displayOrder =
    Number(body.display_order || 0);

  const available =
    body.available === false ? 0 : 1;


  if (!name) {

    return json({
      success: false,
      message: "Cake name is required."
    }, 400);

  }


  await env.DB.prepare(`
    UPDATE cakes
    SET
      name = ?,
      description = ?,
      price = ?,
      category = ?,
      image_url = ?,
      available = ?,
      display_order = ?
    WHERE id = ?
  `)
    .bind(
      name,
      description,
      price,
      category,
      imageUrl,
      available,
      displayOrder,
      id
    )
    .run();


  return json({
    success: true
  });

}


/* =========================
   DELETE CAKE
   ========================= */

async function deleteCake(
  request,
  env,
  id
) {

  if (!(await requireLogin(request, env))) {

    return json({
      success: false,
      message: "Not authorized."
    }, 401);

  }


  await env.DB.prepare(`
    DELETE FROM cakes
    WHERE id = ?
  `)
    .bind(id)
    .run();


  return json({
    success: true
  });

}


/* =========================
   PUBLIC CAKES
   ========================= */

async function getPublicCakes(
  request,
  env
) {

  const result =
    await env.DB.prepare(`
      SELECT
        id,
        name,
        description,
        price,
        category,
        image_url,
        display_order
      FROM cakes
      WHERE available = 1
      ORDER BY display_order ASC, id ASC
    `)
      .all();


  return json({
    success: true,
    cakes: result.results || []
  });

}


/* =========================
   API ROUTER
   ========================= */

async function handleApi(
  request,
  env
) {

  const url =
    new URL(request.url);

  const path =
    url.pathname;


  /* LOGIN */

  if (
    path === "/api/login" &&
    request.method === "POST"
  ) {

    return handleLogin(
      request,
      env
    );

  }


  /* LOGOUT */

  if (
    path === "/api/logout" &&
    request.method === "POST"
  ) {

    return handleLogout(
      request,
      env
    );

  }


  /* CHECK LOGIN */

  if (
    path === "/api/me" &&
    request.method === "GET"
  ) {

    return handleMe(
      request,
      env
    );

  }


  /* PUBLIC CAKES */

  if (
    path === "/api/public/cakes" &&
    request.method === "GET"
  ) {

    return getPublicCakes(
      request,
      env
    );

  }


  /* GET ALL CAKES */

  if (
    path === "/api/cakes" &&
    request.method === "GET"
  ) {

    return getCakes(
      request,
      env
    );

  }


  /* ADD CAKE */

  if (
    path === "/api/cakes" &&
    request.method === "POST"
  ) {

    return addCake(
      request,
      env
    );

  }


  /* UPDATE / DELETE CAKE */

  const cakeMatch =
    path.match(
      /^\/api\/cakes\/(\d+)$/
    );


  if (cakeMatch) {

    const id =
      Number(cakeMatch[1]);


    if (
      request.method === "PUT"
    ) {

      return updateCake(
        request,
        env,
        id
      );

    }


    if (
      request.method === "DELETE"
    ) {

      return deleteCake(
        request,
        env,
        id
      );

    }

  }


  return json({
    success: false,
    message: "API route not found."
  }, 404);

}


/* =========================
   MAIN WORKER
   ========================= */

export default {

  async fetch(request, env) {

    const url =
      new URL(request.url);


    /*
     * All /api/* requests go
     * through our Worker.
     */

    if (
      url.pathname.startsWith("/api/")
    ) {

      try {

        return await handleApi(
          request,
          env
        );

      } catch (error) {

        console.error(
          "API error:",
          error
        );

        return json({
          success: false,
          message: "Server error."
        }, 500);

      }

    }


    /*
     * Everything else is served
     * by the static assets system.
     */

    return env.ASSETS.fetch(
      request
    );

  }

};
