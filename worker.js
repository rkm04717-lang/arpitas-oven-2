/* =========================================
   ARPITA'S OVEN
   SIMPLE ADMIN WORKER
   No username / password
   ========================================= */


/* =========================================
   JSON RESPONSE
   ========================================= */

function json(data, status = 200) {

  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        "Content-Type":
          "application/json; charset=utf-8"
      }
    }
  );

}


/* =========================================
   GET ALL CAKES
   Admin dashboard
   ========================================= */

async function getCakes(env) {

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


/* =========================================
   ADD CAKE
   ========================================= */

async function addCake(request, env) {

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


/* =========================================
   UPDATE CAKE
   ========================================= */

async function updateCake(
  request,
  env,
  id
) {

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


/* =========================================
   DELETE CAKE
   ========================================= */

async function deleteCake(
  env,
  id
) {

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


/* =========================================
   PUBLIC CAKES
   Only available cakes
   ========================================= */

async function getPublicCakes(env) {

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


/* =========================================
   API ROUTER
   ========================================= */

async function handleApi(
  request,
  env
) {

  const url =
    new URL(request.url);

  const path =
    url.pathname;


  /* -----------------------------------------
     PUBLIC CAKES
     ----------------------------------------- */

  if (
    path === "/api/public/cakes" &&
    request.method === "GET"
  ) {

    return getPublicCakes(env);

  }


  /* -----------------------------------------
     ADMIN: GET CAKES
     ----------------------------------------- */

  if (
    path === "/api/cakes" &&
    request.method === "GET"
  ) {

    return getCakes(env);

  }


  /* -----------------------------------------
     ADMIN: ADD CAKE
     ----------------------------------------- */

  if (
    path === "/api/cakes" &&
    request.method === "POST"
  ) {

    return addCake(
      request,
      env
    );

  }


  /* -----------------------------------------
     ADMIN: SPECIFIC CAKE
     ----------------------------------------- */

  const match =
    path.match(
      /^\/api\/cakes\/(\d+)$/
    );


  if (match) {

    const id =
      Number(match[1]);


    /* UPDATE */

    if (
      request.method === "PUT"
    ) {

      return updateCake(
        request,
        env,
        id
      );

    }


    /* DELETE */

    if (
      request.method === "DELETE"
    ) {

      return deleteCake(
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


/* =========================================
   MAIN WORKER
   ========================================= */

export default {

  async fetch(
    request,
    env
  ) {

    const url =
      new URL(request.url);


    /* API */

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


    /* WEBSITE */

    return env.ASSETS.fetch(
      request
    );

  }

};
