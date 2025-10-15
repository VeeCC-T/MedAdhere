export const queueAction = async (action) => {
  const existingQueue = JSON.parse(localStorage.getItem("offlineQueue")) || [];
  existingQueue.push(action);
  localStorage.setItem("offlineQueue", JSON.stringify(existingQueue));
};

export const syncQueuedActions = async () => {
  const queue = JSON.parse(localStorage.getItem("offlineQueue")) || [];
  if (queue.length === 0) return;

  for (const action of queue) {
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
    } catch (err) {
      console.error("Sync failed for", action, err);
      return; // stop syncing if offline again
    }
  }

  // Clear queue after successful sync
  localStorage.removeItem("offlineQueue");
  console.log("✅ All queued actions synced successfully");
};
