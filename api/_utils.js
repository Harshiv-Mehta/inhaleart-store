async function parseJsonBody(req) {
  if (!req) {
    return {};
  }

  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }

  if (typeof req.on === "function") {
    const rawBody = await new Promise((resolve, reject) => {
      const chunks = [];

      req.on("data", (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      req.on("error", reject);
    });

    if (!rawBody) {
      return {};
    }

    try {
      return JSON.parse(rawBody);
    } catch (error) {
      return {};
    }
  }

  return {};
}

module.exports = {
  parseJsonBody,
};
