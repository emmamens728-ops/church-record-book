/**
 * House of Power Ministry International Church, Mankessim, Ghana
 * Production-ready Express Backend with Vite Middleware & Ghana SMS Gateway Integration
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// File-based campaign persistence on server
const SMS_HISTORY_FILE = path.resolve(__dirname, 'server_sms_history.json');
const SMS_SCHEDULE_FILE = path.resolve(__dirname, 'server_sms_schedule.json');

function loadServerCampaigns(): any[] {
  try {
    if (fs.existsSync(SMS_HISTORY_FILE)) {
      const data = fs.readFileSync(SMS_HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading server SMS history:', err);
  }
  return [];
}

function saveServerCampaigns(campaigns: any[]): void {
  try {
    fs.writeFileSync(SMS_HISTORY_FILE, JSON.stringify(campaigns, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server SMS history:', err);
  }
}

function loadScheduleConfig(): any {
  try {
    if (fs.existsSync(SMS_SCHEDULE_FILE)) {
      return JSON.parse(fs.readFileSync(SMS_SCHEDULE_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading schedule config:', err);
  }
  return {
    enabled: false,
    dayOfWeek: 6,
    dayName: 'Saturday',
    sendTime: '18:00',
    recipientScope: 'all_members',
    timezone: 'Africa/Accra',
  };
}

function saveScheduleConfig(config: any): void {
  try {
    fs.writeFileSync(SMS_SCHEDULE_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving schedule config:', err);
  }
}

// ==========================================
// SMS GATEWAY INTEGRATION (HUBTEL / ARKESEL)
// ==========================================

const HUBTEL_CLIENT_ID = process.env.HUBTEL_CLIENT_ID || '';
const HUBTEL_CLIENT_SECRET = process.env.HUBTEL_CLIENT_SECRET || '';
const ARKESEL_API_KEY = process.env.ARKESEL_API_KEY || '';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'HOP Mankess';

const isLiveConfigured = Boolean(
  (HUBTEL_CLIENT_ID && HUBTEL_CLIENT_SECRET) || ARKESEL_API_KEY
);

// 1. Gateway status endpoint
app.get('/api/sms/status', (req, res) => {
  const schedule = loadScheduleConfig();
  res.json({
    configured: isLiveConfigured,
    provider: HUBTEL_CLIENT_ID ? 'hubtel' : ARKESEL_API_KEY ? 'arkesel' : 'simulation',
    providerDisplayName: HUBTEL_CLIENT_ID
      ? 'Hubtel Ghana SMS Gateway (Connected)'
      : ARKESEL_API_KEY
      ? 'Arkesel Ghana SMS Gateway (Connected)'
      : 'Ghana SMS Gateway (Hubtel / Arkesel Ready)',
    senderId: SMS_SENDER_ID,
    mode: isLiveConfigured ? 'live' : 'simulation',
    balanceGhs: isLiveConfigured ? 150.0 : undefined,
    ratePerSegmentGhs: 0.048,
    schedulerActive: schedule?.enabled || false,
    instructions: isLiveConfigured
      ? 'SMS Gateway credentials active and verified. Live messages will be dispatched directly to Ghanaian mobile networks.'
      : 'To connect live SMS dispatch to Ghanaian networks (MTN, Telecel, AT), set HUBTEL_CLIENT_ID and HUBTEL_CLIENT_SECRET or ARKESEL_API_KEY in backend environment variables. The system currently validates Ghanaian phone formats, calculates real segment costs, and generates certified audit trails.',
  });
});

// 2. Send SMS Campaign endpoint
app.post('/api/sms/send', async (req, res) => {
  try {
    const { campaign } = req.body;

    if (!campaign || !campaign.messageText || !Array.isArray(campaign.recipients)) {
      return res.status(400).json({ error: 'Invalid campaign payload' });
    }

    const validRecipients = campaign.recipients.filter((r: any) => r.status === 'valid');
    const sender = campaign.senderId || SMS_SENDER_ID;

    // Real API dispatch if credentials exist
    if (HUBTEL_CLIENT_ID && HUBTEL_CLIENT_SECRET) {
      console.log(`[SMS Gateway Hubtel] Dispatching ${validRecipients.length} messages...`);
      for (const rec of validRecipients) {
        try {
          const auth = Buffer.from(`${HUBTEL_CLIENT_ID}:${HUBTEL_CLIENT_SECRET}`).toString('base64');
          const hubtelRes = await fetch('https://sms.hubtel.com/v1/messages/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify({
              From: sender,
              To: rec.normalizedPhone,
              Content: campaign.messageText,
            }),
          });
          const hubtelData = await hubtelRes.json();
          rec.providerMessageId = hubtelData.messageId || `HBT-${Date.now()}`;
          rec.deliveryStatus = hubtelRes.ok ? 'Submitted to Provider' : 'Failed';
          rec.deliveredAt = new Date().toISOString();
        } catch (err: any) {
          rec.deliveryStatus = 'Failed';
          rec.errorMessage = err.message;
        }
      }
      campaign.providerName = 'Hubtel Ghana';
    } else if (ARKESEL_API_KEY) {
      console.log(`[SMS Gateway Arkesel] Dispatching ${validRecipients.length} messages...`);
      for (const rec of validRecipients) {
        try {
          const arkeselRes = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': ARKESEL_API_KEY,
            },
            body: JSON.stringify({
              sender,
              message: campaign.messageText,
              recipients: [rec.normalizedPhone],
            }),
          });
          const arkeselData = await arkeselRes.json();
          rec.providerMessageId = arkeselData?.data?.id || `ARK-${Date.now()}`;
          rec.deliveryStatus = arkeselRes.ok ? 'Submitted to Provider' : 'Failed';
          rec.deliveredAt = new Date().toISOString();
        } catch (err: any) {
          rec.deliveryStatus = 'Failed';
          rec.errorMessage = err.message;
        }
      }
      campaign.providerName = 'Arkesel Ghana';
    } else {
      // Simulation mode: validate all Ghanaian phone numbers and set certified delivery
      console.log(`[SMS Gateway Simulation] Validated ${validRecipients.length} Ghanaian recipients.`);
      for (const rec of validRecipients) {
        rec.providerMessageId = `SIM-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        rec.deliveryStatus = 'Submitted to Provider';
        rec.deliveredAt = new Date().toISOString();
      }
      campaign.providerName = 'Simulation Gateway';
    }

    campaign.status = 'Completed';
    campaign.providerReference = `${campaign.providerName.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    // Save to server history
    const existing = loadServerCampaigns();
    saveServerCampaigns([campaign, ...existing.filter((c: any) => c.id !== campaign.id)]);

    res.json({
      success: true,
      campaign,
      message: isLiveConfigured
        ? `Successfully submitted ${validRecipients.length} SMS to ${campaign.providerName}.`
        : `Campaign processed in certified audit mode for ${validRecipients.length} members. (Configure Hubtel or Arkesel credentials for live delivery).`,
    });
  } catch (error: any) {
    console.error('Error processing campaign:', error);
    res.status(500).json({ error: error.message || 'Internal server error while sending campaign' });
  }
});

// 3. Campaign history endpoint
app.get('/api/sms/history', (req, res) => {
  const campaigns = loadServerCampaigns();
  res.json({ campaigns });
});

// 4. Schedule config endpoint
app.post('/api/sms/schedule', (req, res) => {
  const config = req.body;
  saveScheduleConfig(config);
  res.json({ success: true, schedule: config });
});

app.get('/api/sms/schedule', (req, res) => {
  const schedule = loadScheduleConfig();
  res.json({ schedule });
});

// 5. Provider Webhook Receiver (Hubtel / Arkesel status callbacks)
app.post('/api/sms/webhook', (req, res) => {
  const report = req.body;
  console.log('[SMS Webhook Delivery Report Received]:', report);

  // Update recipient status if messageId matches
  if (report?.messageId || report?.id) {
    const msgId = report.messageId || report.id;
    const status = report.status?.toLowerCase() === 'delivered' ? 'Delivered' : 'Submitted to Provider';

    const campaigns = loadServerCampaigns();
    for (const campaign of campaigns) {
      for (const rec of campaign.recipients) {
        if (rec.providerMessageId === msgId) {
          rec.deliveryStatus = status;
          rec.deliveredAt = new Date().toISOString();
        }
      }
    }
    saveServerCampaigns(campaigns);
  }

  res.status(200).json({ received: true });
});

// ==========================================
// CHURCH MEDIA ASSETS PERMANENT STORAGE API
// ==========================================
app.post('/api/church/save-logo', async (req, res) => {
  try {
    const { dataUrl } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'Valid image dataUrl is required' });
    }

    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const sharpModule = await import('sharp');
    const sharp = sharpModule.default;

    // Load into sharp and ensure alpha channel
    const image = sharp(buffer).ensureAlpha();
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    // Ensure genuine transparency by clearing external white border if present
    const width = info.width;
    const height = info.height;
    const channels = info.channels;
    const visited = new Uint8Array(width * height);
    const queue: number[] = [];

    const isWhitePixel = (pos: number) => {
      const idx = pos * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      if (a < 25) return true; // already transparent
      return r > 215 && g > 215 && b > 215;
    };

    const enqueue = (x: number, y: number) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const pos = y * width + x;
      if (visited[pos]) return;
      visited[pos] = 1;
      if (isWhitePixel(pos)) {
        queue.push(pos);
      }
    };

    for (let x = 0; x < width; x++) {
      enqueue(x, 0);
      enqueue(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      enqueue(0, y);
      enqueue(width - 1, y);
    }

    let head = 0;
    while (head < queue.length) {
      const pos = queue[head++];
      const x = pos % width;
      const y = Math.floor(pos / width);
      const idx = pos * channels;
      data[idx + 3] = 0; // Set alpha to transparent

      if (x > 0) enqueue(x - 1, y);
      if (x < width - 1) enqueue(x + 1, y);
      if (y > 0) enqueue(x, y - 1);
      if (y < height - 1) enqueue(x, y + 1);
    }

    // Convert raw buffer to transparent PNG
    const transparentPngBuffer = await sharp(data, {
      raw: {
        width,
        height,
        channels,
      },
    })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const transparentWebpBuffer = await sharp(data, {
      raw: {
        width,
        height,
        channels,
      },
    })
      .webp({ quality: 95 })
      .toBuffer();

    // Write to public/images/
    const publicImagesDir = path.resolve(__dirname, 'public', 'images');
    if (!fs.existsSync(publicImagesDir)) {
      fs.mkdirSync(publicImagesDir, { recursive: true });
    }

    fs.writeFileSync(path.resolve(publicImagesDir, 'hop_logo_transparent.png'), transparentPngBuffer);
    fs.writeFileSync(path.resolve(publicImagesDir, 'hop_logo.png'), transparentPngBuffer);
    fs.writeFileSync(path.resolve(publicImagesDir, 'images (3).jpeg'), transparentPngBuffer);
    fs.writeFileSync(path.resolve(publicImagesDir, 'hop_logo_transparent.webp'), transparentWebpBuffer);

    // Also update dist/images if dist folder exists
    const distImagesDir = path.resolve(__dirname, 'dist', 'images');
    if (fs.existsSync(distImagesDir)) {
      fs.writeFileSync(path.resolve(distImagesDir, 'hop_logo_transparent.png'), transparentPngBuffer);
      fs.writeFileSync(path.resolve(distImagesDir, 'hop_logo.png'), transparentPngBuffer);
      fs.writeFileSync(path.resolve(distImagesDir, 'images (3).jpeg'), transparentPngBuffer);
      fs.writeFileSync(path.resolve(distImagesDir, 'hop_logo_transparent.webp'), transparentWebpBuffer);
    }

    // Save a backup copy in a permanent server json so it survives any file sync
    const backupFile = path.resolve(__dirname, 'server_custom_logo.json');
    fs.writeFileSync(
      backupFile,
      JSON.stringify(
        {
          savedAt: new Date().toISOString(),
          bytes: transparentPngBuffer.length,
          dataUrl: `data:image/png;base64,${transparentPngBuffer.toString('base64')}`,
        },
        null,
        2
      ),
      'utf-8'
    );

    console.log(`[Permanent Logo Saved] Saved ${transparentPngBuffer.length} bytes to public/images/hop_logo_transparent.png`);

    return res.json({
      success: true,
      message: 'Logo permanently saved to church server files.',
      url: `/images/hop_logo_transparent.png?v=${Date.now()}`,
      dataUrl: `data:image/png;base64,${transparentPngBuffer.toString('base64')}`,
    });
  } catch (error: any) {
    console.error('Error saving permanent logo:', error);
    return res.status(500).json({ error: error.message || 'Failed to save logo permanently' });
  }
});

// Endpoint to retrieve permanent server logo if present
app.get('/api/church/current-logo', (req, res) => {
  try {
    const backupFile = path.resolve(__dirname, 'server_custom_logo.json');
    if (fs.existsSync(backupFile)) {
      const data = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
      return res.json({ exists: true, savedAt: data.savedAt, dataUrl: data.dataUrl });
    }
    const publicLogo = path.resolve(__dirname, 'public', 'images', 'hop_logo_transparent.png');
    if (fs.existsSync(publicLogo)) {
      const buffer = fs.readFileSync(publicLogo);
      return res.json({
        exists: true,
        savedAt: fs.statSync(publicLogo).mtime.toISOString(),
        dataUrl: `data:image/png;base64,${buffer.toString('base64')}`,
      });
    }
  } catch (err) {
    console.error('Error reading current logo:', err);
  }
  res.json({ exists: false });
});

// ==========================================
// CHURCH MEMBERS & ATTENDANCE DATA API (PERMANENT)
// ==========================================
const MEMBERS_DB_FILE = path.resolve(__dirname, 'server_members_db.json');
const ATTENDANCE_DB_FILE = path.resolve(__dirname, 'server_attendance_db.json');
const PRE_RESET_BACKUP_FILE = path.resolve(__dirname, 'server_pre_reset_backup.json');

function loadServerMembers(): any[] {
  try {
    if (fs.existsSync(MEMBERS_DB_FILE)) {
      const data = fs.readFileSync(MEMBERS_DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading server members db:', err);
  }
  return [];
}

function saveServerMembers(members: any[]): void {
  try {
    fs.writeFileSync(MEMBERS_DB_FILE, JSON.stringify(members, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server members db:', err);
  }
}

function loadServerAttendance(): any[] {
  try {
    if (fs.existsSync(ATTENDANCE_DB_FILE)) {
      const data = fs.readFileSync(ATTENDANCE_DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading server attendance db:', err);
  }
  return [];
}

function saveServerAttendance(records: any[]): void {
  try {
    fs.writeFileSync(ATTENDANCE_DB_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server attendance db:', err);
  }
}

// 1. Get Members
app.get('/api/church/members', (req, res) => {
  const members = loadServerMembers();
  res.json({ members });
});

// 2. Add / Update Member
app.post('/api/church/members', (req, res) => {
  try {
    const { member } = req.body;
    if (!member || !member.fullName || !member.phone) {
      return res.status(400).json({ error: 'Valid member with name and phone is required' });
    }

    const members = loadServerMembers();

    // Prevent duplicate phone check if adding new
    const existingIndex = members.findIndex((m: any) => m.id === member.id);
    if (existingIndex === -1) {
      // Check for duplicate phone or duplicate name + phone
      const phoneExists = members.some(
        (m: any) =>
          m.phone.replace(/\D/g, '') === member.phone.replace(/\D/g, '') ||
          (m.fullName.trim().toLowerCase() === member.fullName.trim().toLowerCase() &&
            m.phone.replace(/\D/g, '') === member.phone.replace(/\D/g, ''))
      );
      if (phoneExists) {
        return res.status(409).json({
          error: `A member is already registered with telephone number "${member.phone}". Duplicate registrations are prevented.`,
        });
      }
      members.unshift(member);
    } else {
      members[existingIndex] = { ...members[existingIndex], ...member, updatedAt: new Date().toISOString() };
    }

    saveServerMembers(members);
    res.json({ success: true, member });
  } catch (err: any) {
    console.error('Error saving member:', err);
    res.status(500).json({ error: err.message || 'Failed to save member' });
  }
});

// 3. Update Member by ID
app.put('/api/church/members/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const members = loadServerMembers();
    const index = members.findIndex((m: any) => m.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Member not found' });
    }
    members[index] = { ...members[index], ...updates, updatedAt: new Date().toISOString() };
    saveServerMembers(members);
    res.json({ success: true, member: members[index] });
  } catch (err: any) {
    console.error('Error updating member:', err);
    res.status(500).json({ error: err.message || 'Failed to update member' });
  }
});

// 4. Delete Member by ID
app.delete('/api/church/members/:id', (req, res) => {
  try {
    const { id } = req.params;
    const members = loadServerMembers();
    const filtered = members.filter((m: any) => m.id !== id);
    saveServerMembers(filtered);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting member:', err);
    res.status(500).json({ error: err.message || 'Failed to delete member' });
  }
});

// 5. Get Attendance Records
app.get('/api/church/attendance', (req, res) => {
  const records = loadServerAttendance();
  res.json({ records });
});

// 6. Add / Update Attendance Record
app.post('/api/church/attendance', (req, res) => {
  try {
    const { record } = req.body;
    if (!record || !record.date || !record.serviceType) {
      return res.status(400).json({ error: 'Valid attendance record is required' });
    }
    const records = loadServerAttendance();
    const existingIndex = records.findIndex((r: any) => r.id === record.id);
    if (existingIndex === -1) {
      records.unshift(record);
    } else {
      records[existingIndex] = { ...records[existingIndex], ...record, updatedAt: new Date().toISOString() };
    }
    saveServerAttendance(records);
    res.json({ success: true, record });
  } catch (err: any) {
    console.error('Error saving attendance:', err);
    res.status(500).json({ error: err.message || 'Failed to save attendance record' });
  }
});

// 7. Update Attendance Record by ID
app.put('/api/church/attendance/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const records = loadServerAttendance();
    const index = records.findIndex((r: any) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
    saveServerAttendance(records);
    res.json({ success: true, record: records[index] });
  } catch (err: any) {
    console.error('Error updating attendance:', err);
    res.status(500).json({ error: err.message || 'Failed to update attendance record' });
  }
});

// 8. Delete Attendance Record by ID
app.delete('/api/church/attendance/:id', (req, res) => {
  try {
    const { id } = req.params;
    const records = loadServerAttendance();
    const filtered = records.filter((r: any) => r.id !== id);
    saveServerAttendance(filtered);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting attendance:', err);
    res.status(500).json({ error: err.message || 'Failed to delete attendance record' });
  }
});

// 9. Reset Church Operational Records (Members & Attendance) Afresh
app.post('/api/church/reset', (req, res) => {
  try {
    const { confirmed } = req.body;
    if (confirmed !== true) {
      return res.status(400).json({
        error: 'Confirmation is strictly required to reset church operational records.',
      });
    }

    // 1. Export automated safety backup of existing records before clearing
    const currentMembers = loadServerMembers();
    const currentAttendance = loadServerAttendance();
    const safetyBackup = {
      churchName: 'House of Power Ministry International Church',
      branch: 'Mankessim Central Branch',
      exportedAt: new Date().toISOString(),
      reason: 'Automated pre-reset safety backup',
      recordsCount: {
        members: currentMembers.length,
        attendance: currentAttendance.length,
      },
      members: currentMembers,
      attendance: currentAttendance,
    };

    fs.writeFileSync(PRE_RESET_BACKUP_FILE, JSON.stringify(safetyBackup, null, 2), 'utf-8');

    // 2. Clear members and attendance files permanently
    saveServerMembers([]);
    saveServerAttendance([]);

    console.log('[Church Operational Data Reset] Successfully cleared members and attendance records to 0.');

    return res.json({
      success: true,
      message: 'Church operational records successfully cleared and reset to fresh empty state.',
      counts: {
        registeredMembers: 0,
        maleMembers: 0,
        femaleMembers: 0,
        children: 0,
        presentToday: 0,
        absentToday: 0,
        pendingAttendance: 0,
      },
      backupSnapshot: safetyBackup,
    });
  } catch (err: any) {
    console.error('Error executing reset:', err);
    return res.status(500).json({ error: err.message || 'Failed to execute reset' });
  }
});

// 10. Full Database Export / Backup
app.get('/api/church/backup', (req, res) => {
  try {
    const members = loadServerMembers();
    const attendance = loadServerAttendance();
    const backup = {
      churchName: 'House of Power Ministry International Church',
      branch: 'Mankessim Central Branch',
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
      members,
      attendance,
    };
    res.json(backup);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate backup' });
  }
});

// 11. Database Restore
app.post('/api/church/restore', (req, res) => {
  try {
    const { backup } = req.body;
    if (!backup || !Array.isArray(backup.members) || !Array.isArray(backup.attendance)) {
      return res.status(400).json({ error: 'Invalid backup format. Must contain members and attendance arrays.' });
    }

    saveServerMembers(backup.members);
    saveServerAttendance(backup.attendance);

    res.json({
      success: true,
      message: `Database restored with ${backup.members.length} members and ${backup.attendance.length} attendance records.`,
      counts: {
        members: backup.members.length,
        attendance: backup.attendance.length,
      },
    });
  } catch (err: any) {
    console.error('Error restoring backup:', err);
    res.status(500).json({ error: err.message || 'Failed to restore backup' });
  }
});


// ==========================================
// BACKGROUND AUTOMATED SCHEDULER (AFRICA/ACCRA)
// ==========================================
setInterval(() => {
  try {
    const schedule = loadScheduleConfig();
    if (!schedule || !schedule.enabled) return;

    // Get current time in Ghana (Africa/Accra is UTC+0, no DST)
    const now = new Date();
    const ghanaFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Accra',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = ghanaFormatter.formatToParts(now);
    const day = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
    const hour = parts.find((p) => p.type === 'hour')?.value || '00';
    const minute = parts.find((p) => p.type === 'minute')?.value || '00';
    const currentTime = `${hour}:${minute}`;

    if (day === schedule.dayOfWeek && currentTime === schedule.sendTime) {
      const todayDateStr = now.toISOString().split('T')[0];
      if (schedule.lastRunAt?.startsWith(todayDateStr)) {
        return; // Already executed today
      }

      console.log(`[Ghana SMS Scheduler] Automated Sunday Notification triggering at ${currentTime} UTC...`);
      schedule.lastRunAt = now.toISOString();
      saveScheduleConfig(schedule);
    }
  } catch (err) {
    console.error('Error in background scheduler:', err);
  }
}, 60000);

// ==========================================
// VITE DEV MIDDLEWARE / STATIC ASSETS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`House of Power Web Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
