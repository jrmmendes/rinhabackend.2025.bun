Bun.serve({
  port: 9999,
  routes: {
    "/payments": new Response("Not implemented", { status: 501 }),
    "/payments-summary": new Response("Not implemented", { status: 501 }),
    "/health-check": new Response("Not implemented", { status: 501 })
  }
});

console.log('server started')
