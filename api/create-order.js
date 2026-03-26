const { parseJsonBody } = require("./_utils");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(500).json({ error: "Razorpay keys are not configured" });
  }

  try {
    const body = await parseJsonBody(req);
    const { amount, notes } = body || {};
    const normalizedAmount = Number(amount);

    if (!Number.isInteger(normalizedAmount) || normalizedAmount < 100) {
      return res.status(400).json({ error: "Invalid order amount" });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: normalizedAmount,
        currency: "INR",
        receipt: `inhaleart_${Date.now()}`,
        notes: notes && typeof notes === "object" ? notes : {},
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.description || "Failed to create Razorpay order",
      });
    }

    return res.status(200).json({
      key: keyId,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to create payment order" });
  }
};
