import { Router } from "express";
import { ethers } from "ethers";
import { adminAuth } from "../lib/firebaseAdmin.js";

const router  = Router();
const MESSAGE = "Sign in to AGORA";

router.post("/wallet", async (req, res) => {
  try {
    const { address, signature } = req.body;
    if (!address || !signature) {
      return res.status(400).json({ error: "address and signature required" });
    }

    const recovered = ethers.verifyMessage(MESSAGE, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: "Signature mismatch" });
    }

    let uid: string;
    try {
      const existing = await adminAuth.getUserByEmail(`${address.toLowerCase()}@wallet.agora`);
      uid = existing.uid;
    } catch {
      const created = await adminAuth.createUser({
        email:    `${address.toLowerCase()}@wallet.agora`,
        password: ethers.hexlify(ethers.randomBytes(32)),
      });
      uid = created.uid;
    }

    const customToken = await adminAuth.createCustomToken(uid);
    res.json({ customToken });
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Auth failed" });
  }
});

export default router;
