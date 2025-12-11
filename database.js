import PocketBase from "pocketbase";

let superUserClient = null;

export async function getPocketbase() {
  if (!superUserClient) {
    superUserClient = new PocketBase(process.env.DATABASE_URL);
    superUserClient.autoCancellation(false);

    if (process.env.PB_SUPERUSER_TOKEN) {
      // Option A: using a long-lived API key
      superUserClient.authStore.save(process.env.PB_SUPERUSER_TOKEN, null);
    } else {
      // Option B: login with email/password
      await superUserClient
        .collection("_superusers")
        .authWithPassword(
          process.env.DATABASE_USERNAME,
          process.env.DATABASE_SECRET
        );
    }
  }
  return superUserClient;
}
