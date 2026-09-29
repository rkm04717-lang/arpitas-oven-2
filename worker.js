const ADMIN_USERNAME = "arpitasovenadmin";

const SESSION_COOKIE = "ao_admin_session";
const SESSION_DAYS = 1;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

function sessionCookie(sessionId) {
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${SESSION_DAYS * 24 * 60 * 60}`
  ].join("; ");
}

function clearSessionCookie() {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0"
  ].join("; ");
}

async function createSession(env) {
  const id = crypto.randomUUID();

  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  await env.DB.prepare(
    `INSERT INTO admin_sessions (id, expires_at)
     VALUES (?, ?)`
  )
    .bind(id, expiresAt)
    .run();

  return id;
}

async function getSession(request, env) {
  const sessionId = getCookie(request, SESSION_COOKIE);

  if (!sessionId) {
    return null;
  }

  const session = await env.DB.prepare(
    `SELECT id, expires_at
     FROM admin_sessions
     WHERE id = ?
     LIMIT 1`
  )
    .bind(sessionId)
    .first();

  if (!session) {
    return null;
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    await env.DB.prepare(
      `DELETE FROM admin_sessions WHERE id = ?`
    )
      .bind(sessionId)
      .run();

    return null;
  }

  return session;
}

async function requireAdmin(request, env) {
  const session = await getSession(request, env);

  if (!session) {
    return false;
  }

  return true;
}

async function handleLogin(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        success: false,
        message: "Invalid request."
      },
      400
    );
  }

  const username = String(body.username || "");
  const password = String(body.password || "");

  if (
    username !== ADMIN_USERNAME ||
    !env.ADMIN_PASSWORD ||
    password !== env.ADMIN_PASSWORD
  ) {
    return json(
      {
        success: false,
        message: "Invalid username or password."
      },
      401
    );
  }

  const sessionId = await createSession(env);

  return new Response(
    JSON.stringify({
      success: true
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Set-Cookie": sessionCookie(sessionId)
      }
    }
  );
}

async function handleLogout(request, env) {
  const sessionId = getCookie(request, SESSION_COOKIE);

  if (sessionId) {
    await env.DB.prepare(
      `DELETE FROM admin_sessions WHERE id = ?`
    )
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
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Set-Cookie": clearSessionCookie()
      }
    }
  );
}

async function handleMe(request, env) {
  const loggedIn = await requireAdmin(request, env);

  return json({
    loggedIn
  });
}

async function handleGetCakes(request, env) {
  if (!(await requireAdmin(request, env))) {
    return json(
      {
        success: false,
        message: "Unauthorized."
      },
      401
    );
  }

  const result = await env.DB.prepare(
    `SELECT *
     FROM cakes
     ORDER BY display_order ASC, id DESC`
  ).all();

  return json({
    success: true,
    cakes: result.results || []
  });
}

async function handleCreateCake(request, env) {
  if (!(await requireAdmin(request, env))) {
    return json(
      {
        success: false,
        message: "Unauthorized."
      },
      401
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        success: false,
        message: "Invalid request."
      },
      400
    );
  }

  const name = String(body.name || "").trim();

  if (!name) {
    return json(
      {
        success: false,
        message: "Cake name is required."
      },
      400
    );
  }

  const description = String(body.description || "").trim();
  const price = String(body.price || "").trim();
  const category = String(body.category || "").trim();
  const imageUrl = String(body.image_url || "").trim();
  const displayOrder = Number(body.display_order || 0);
  const available = body.available === false ? 0 : 1;

  const result = await env.DB.prepare(
    `INSERT INTO cakes
      (name, description, price, category, image_url, available, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
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

async function handleDeleteCake(request, env, id) {
  if (!(await requireAdmin(request, env))) {
    return json(
      {
        success: false,
        message: "Unauthorized."
      },
      401
    );
  }

  await env.DB.prepare(
    `DELETE FROM cakes WHERE id = ?`
  )
    .bind(id)
    .run();

  return json({
    success: true
  });
}

async function handleUpdateCake(request, env, id) {
  if (!(await requireAdmin(request, env))) {
    return json(
      {
        success: false,
        message: "Unauthorized."
      },
      401
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        success: false,
        message: "Invalid request."
      },
      400
    );
  }

  const name = String(body.name || "").trim();

  if (!name) {
    return json(
      {
        success: false,
        message: "Cake name is required."
      },
      400
    );
  }

  const description = String(body.description || "").trim();
  const price = String(body.price || "").trim();
  const category = String(body.category || "").trim();
  const imageUrl = String(body.image_url || "").trim();
  const displayOrder = Number(body.display_order || 0);
  const available = body.available === false ? 0 : 1;

  await env.DB.prepare(
    `UPDATE cakes
     SET
       name = ?,
       description = ?,
       price = ?,
       category = ?,
       image_url = ?,
       available = ?,
       display_order = ?
     WHERE id = ?`
  )
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

async function handleApi(request, env) {
  const url = new URL(request.url);

  if (url.pathname === "/api/login" && request.method === "POST") {
    return handleLogin(request, env);
  }

  if (url.pathname === "/api/logout" && request.method === "POST") {
    return handleLogout(request, env);
  }

  if (url.pathname === "/api/me" && request.method === "GET") {
    return handleMe(request, env);
  }

  if (url.pathname === "/api/cakes" && request.method === "GET") {
    return handleGetCakes(request, env);
  }

  if (url.pathname === "/api/cakes" && request.method === "POST") {
    return handleCreateCake(request, env);
  }

  const cakeMatch = url.pathname.match(/^\/api\/cakes\/(\d+)$/);

  if (cakeMatch) {
    const id = Number(cakeMatch[1]);

    if (request.method === "PUT") {
      return handleUpdateCake(request, env, id);
    }

    if (request.method === "DELETE") {
      return handleDeleteCake(request, env, id);
    }
  }

  return json(
    {
      success: false,
      message: "API route not found."
    },
    404
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(request, env);
      } catch (error) {
        console.error(error);

        return json(
          {
            success: false,
            message: "Server error."
          },
          500
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
