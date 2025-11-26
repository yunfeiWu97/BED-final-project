/**
 * One-off script: set custom claims for demo users.
 * - user@demo.test  -> roles: ["user"]
 * - guest@demo.test    -> roles: ["guest"]  (will be 403 on write)
 *
 * Usage: npm run set-claims
 */
import "dotenv/config";
import { auth } from "../config/firebaseConfig";

/**
 * Assign Firebase custom claims to a user identified by email.
 * @param email - The user's email address.
 * @param roles - Array of role names to set (e.g., ["user"], ["guest"]).
 */
async function setClaims(email: string, roles: string[]): Promise<void> {
  const userRecord = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(userRecord.uid, { roles });
  console.log(`Set roles for ${email}:`, roles, "uid:", userRecord.uid);
}

(async () => {
  await setClaims("user@demo.test", ["user"]);
  await setClaims("guest@demo.test", ["guest"]);
  console.log("Done.");
  process.exit(0);
})();
