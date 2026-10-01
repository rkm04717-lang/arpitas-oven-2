/* =========================================
   ARPITA'S OVEN
   SIMPLE ADMIN WORKER
   Cakes + Gallery
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
   ADMIN
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


  /*
    IMPORTANT:
    cakes.html expects an ARRAY directly.
  */

  return json(
    result.results || []
  );

}


/* =========================================
   =========================================
   GALLERY
   =========================================
   ========================================= */


/* =========================================
   GET ALL GALLERY ITEMS
   ADMIN
   ========================================= */

async function getGallery(env) {

  const result =
    await env.DB.prepare(`
      SELECT
        id,
        title,
        category,
        image_url,
        display_order,
        created_at
      FROM gallery
      ORDER BY display_order ASC, id DESC
    `)
      .all();


  return json({
    success: true,
    gallery: result.results || []
  });

}


/* =========================================
   ADD GALLERY ITEM
   ========================================= */

async function addGallery(request, env) {

  let body;

  try {

    body =
      await request.json();

  } catch {

    return json({
      success: false,
      message: "Invalid request."
    }, 400);

  }


  const title =
    String(
      body.title || ""
    ).trim();


  const category =
    String(
      body.category || ""
    ).trim();


  const imageUrl =
    String(
      body.image_url || ""
    ).trim();


  const displayOrder =
    Number(
      body.display_order || 0
    );


  if (!title) {

    return json({
      success: false,
      message: "Gallery title is required."
    }, 400);

  }


  if (!imageUrl) {

    return json({
      success: false,
      message: "Gallery image is required."
    }, 400);

  }


  const result =
    await env.DB.prepare(`
      INSERT INTO gallery
      (
        title,
        category,
        image_url,
        display_order
      )
      VALUES (?, ?, ?, ?)
    `)
      .bind(
        title,
        category,
        imageUrl,
        displayOrder
      )
      .run();


  return json({
    success: true,
    id:
      result.meta?.last_row_id || null
  });

}


/* =========================================
   DELETE GALLERY ITEM
   ========================================= */

async function deleteGallery(
  env,
  id
) {

  await env.DB.prepare(`
    DELETE FROM gallery
    WHERE id = ?
  `)
    .bind(id)
    .run();


  return json({
    success: true
  });

}


/* =========================================
   PUBLIC GALLERY
   ========================================= */

async function getPublicGallery(env) {

  const result =
    await env.DB.prepare(`
      SELECT
        id,
        title,
        category,
        image_url,
        display_order
      FROM gallery
      ORDER BY display_order ASC, id DESC
    `)
      .all();


  /*
    Return array directly.
    gallery.html supports this format.
  */

  return json(
    result.results || []
  );

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


  /* =========================================
     PUBLIC CAKES
     ========================================= */

  if (
    path === "/api/public/cakes" &&
    request.method === "GET"
  ) {

    return getPublicCakes(env);

  }


  /* =========================================
     ADMIN CAKES
     ========================================= */

  if (
    path === "/api/cakes" &&
    request.method === "GET"
  ) {

    return getCakes(env);

  }


  if (
    path === "/api/cakes" &&
    request.method === "POST"
  ) {

    return addCake(
      request,
      env
    );

  }


  /* =========================================
     ADMIN SPECIFIC CAKE
     ========================================= */

  const cakeMatch =
    path.match(
      /^\/api\/cakes\/(\d+)$/
    );


  if (cakeMatch) {

    const id =
      Number(
        cakeMatch[1]
      );


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
        env,
        id
      );

    }

  }


  /* =========================================
     PUBLIC GALLERY
     ========================================= */

  if (
    path === "/api/public/gallery" &&
    request.method === "GET"
  ) {

    return getPublicGallery(
      env
    );

  }


  /* =========================================
     ADMIN GALLERY
     ========================================= */

  if (
    path === "/api/gallery" &&
    request.method === "GET"
  ) {

    return getGallery(
      env
    );

  }


  if (
    path === "/api/gallery" &&
    request.method === "POST"
  ) {

    return addGallery(
      request,
      env
    );

  }


  /* =========================================
     DELETE SPECIFIC GALLERY ITEM
     ========================================= */

  const galleryMatch =
    path.match(
      /^\/api\/gallery\/(\d+)$/
    );


  if (galleryMatch) {

    const id =
      Number(
        galleryMatch[1]
      );


    if (
      request.method === "DELETE"
    ) {

      return deleteGallery(
        env,
        id
      );

    }

  }


  /* =========================================
     API NOT FOUND
     ========================================= */

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


    /* =========================================
       API REQUEST
       ========================================= */

    if (
      url.pathname.startsWith(
        "/api/"
      )
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


    /* =========================================
       WEBSITE
       ========================================= */

    return env.ASSETS.fetch(
      request
    );

  }

};
