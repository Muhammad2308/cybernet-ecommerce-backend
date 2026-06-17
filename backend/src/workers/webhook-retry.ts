import cron from 'node-cron'
import { processPendingRetries } from '../services/webhook.service'

// Runs every 30 seconds to pick up pending webhook retries
export function startWebhookRetryWorker(): void {
  cron.schedule('*/1 * * * *', async () => {
    try {
      await processPendingRetries()
    } catch (err) {
      console.error('[WebhookRetry] worker error:', err)
    }
  })

  console.log('[WebhookRetry] scheduled (every 1 minute)')
}
