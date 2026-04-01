const cron = require('node-cron');
const MaintenanceIssue = require('../models/MaintenanceIssue');
const SentReport       = require('../models/SentReport');
const User             = require('../models/User');

/**
 * Runs every day at 8:00 AM server time.
 * Generates a daily maintenance summary and sends it to all admin users.
 */
const scheduleDailyReport = () => {
  // Cron syntax: '0 18 * * *' = every day at 18:00 (6:00 PM)
  cron.schedule('0 18 * * *', async () => {
    console.log('[CRON] Running daily maintenance report at 6:00 PM...');
    try {
      const today     = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      today.setHours(23, 59, 59, 999);

      // Fetch all issues from the last 24 hours
      const issues = await MaintenanceIssue.find({
        createdAt: { $gte: yesterday, $lte: today },
      });

      // Build summary data
      const data = issues.map(i => ({
        Vehicle:      i.vehiclePlate,
        Issue:        i.issue.slice(0, 60),
        Priority:     i.priority,
        Status:       i.status,
        Reporter:     i.reporterName || '—',
        'Est. Cost':  i.estimatedCost || 0,
        'Act. Cost':  i.actualCost || 0,
        Date:         new Date(i.createdAt).toLocaleDateString(),
      }));

      // Stats summary row
      const pending    = issues.filter(i => i.status === 'pending').length;
      const inProgress = issues.filter(i => i.status === 'in-progress').length;
      const completed  = issues.filter(i => i.status === 'completed').length;
      const totalCost  = issues.reduce((s, i) => s + (i.actualCost || 0), 0);

      console.log(`[CRON] Found ${issues.length} issues for daily report.`);

      if (issues.length === 0) {
        console.log('[CRON] No issues today — skipping report.');
        return;
      }

      // Find all admin users
      const admins = await User.find({ role: 'ADMIN', isActive: true }).select('username');
      if (!admins.length) {
        console.log('[CRON] No admin users found.');
        return;
      }

      const reportName = `Daily Maintenance Report — ${yesterday.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`;
      const columns    = ['Vehicle','Issue','Priority','Status','Reporter','Est. Cost','Act. Cost','Date'];

      // Save report for each admin
      await Promise.all(admins.map(admin =>
        new SentReport({
          reportType: 'maintenance',
          reportName,
          sentTo:  admin.username,
          sentBy:  'System (Auto)',
          data,
          columns,
        }).save()
      ));

      console.log(`[CRON] Daily maintenance report sent to ${admins.length} admin(s). Issues: ${issues.length}, Pending: ${pending}, In-Progress: ${inProgress}, Completed: ${completed}, Total Cost: ${totalCost} ETB`);
    } catch (err) {
      console.error('[CRON] Daily maintenance report failed:', err.message);
    }
  });

  console.log('[CRON] Daily maintenance report scheduled at 18:00 (6:00 PM) every day.');
};

module.exports = scheduleDailyReport;
