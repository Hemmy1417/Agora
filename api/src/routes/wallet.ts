import { Router } from "express";
import { ethers } from "ethers";
import { adminAuth, db } from "../lib/firebaseAdmin.js";
import { encrypt, decrypt } from "../lib/crypto.js";

const router = Router();

async function uid(req: { headers: { authorization?: string } }): Promise<string> {
  const token = req.headers.authorization?.replace("Bearer ", "") || "";
  const decoded = await adminAuth.verifyIdToken(token);
  return decoded.uid;
}

router.post("/create", async (req, res) => {
  try {
    const userId = await uid(req);
    const ref    = db.collection("wallets").doc(userId);
    const snap   = await ref.get();

    if (snap.exists) {
      const data = snap.data()!;
      return res.json({ address: data.address });
    }

    const wallet = ethers.Wallet.createRandom();
    await ref.set({
      address:             wallet.address,
      encryptedPrivateKey: encrypt(wallet.privateKey),
      createdAt:           Date.now(),
    });

    res.json({ address: wallet.address });
  } catch (e: unknown) {
    res.status(401).json({ error: e instanceof Error ? e.message : "Auth failed" });
  }
});

router.post("/export", async (req, res) => {
  try {
    const userId = await uid(req);
    const snap   = await db.collection("wallets").doc(userId).get();
    if (!snap.exists) return res.status(404).json({ error: "No wallet" });
    const privateKey = decrypt(snap.data()!.encryptedPrivateKey);
    res.json({ privateKey });
  } catch (e: unknown) {
    res.status(401).json({ error: e instanceof Error ? e.message : "Auth failed" });
  }
});

export default router;
