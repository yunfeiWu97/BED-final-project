/**
 * One-off script: set custom claims for demo users.
 * - user@demo.test  -> roles: ["user"]
 * - guest@demo.test    -> roles: ["guest"]  (will be 403 on write)
 * - userbutnotonwer@demo.test-> roles: ["user"]   (used to show owner-only 404)
 *
 * Usage: npm run set-claims
 */
import "dotenv/config";
import { auth } from "../config/firebaseConfig";

async function setClaims(email: string, roles: string[]) {
  const u = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(u.uid, { roles });
  console.log(`Set roles for ${email}:`, roles, "uid:", u.uid);
}

(async () => {
  await setClaims("user@demo.test", ["user"]);
  await setClaims("guest@demo.test", ["guest"]);
  await setClaims("userbutnotowner@demo.test", ["user"]);
  console.log("Done.");
  process.exit(0);
})();
