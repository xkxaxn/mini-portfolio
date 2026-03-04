/* global process */
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Path to the data file
const DATA_FILE = path.join(__dirname, 'public', 'projects.json');

/**
 * Helper to read JSON data safely
 */
async function getProjectData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file:', error);
        throw new Error('Could not read project data');
    }
}

// API: Get projects data
app.get('/api/projects', async (req, res) => {
    try {
        const data = await getProjectData();
        // Remove adminSecret from the response for security
        const { adminSecret: _, ...publicData } = data;
        res.json(publicData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Update projects data
app.post('/api/projects', async (req, res) => {
    try {
        const incoming = req.body;
        let existing = {};
        try {
            existing = await getProjectData();
        } catch {
            existing = {};
        }
        const merged = { ...incoming };
        if (existing && typeof existing === 'object' && typeof existing.adminSecret !== 'undefined' && typeof merged.adminSecret === 'undefined') {
            merged.adminSecret = existing.adminSecret;
        }
        await fs.writeFile(DATA_FILE, JSON.stringify(merged, null, 2), 'utf8');
        res.json({ message: 'Data updated successfully' });
    } catch (error) {
        console.error('Error writing data file:', error);
        res.status(500).json({ error: 'Error saving data' });
    }
});

// API: Admin authentication
app.post('/api/auth', async (req, res) => {
    try {
        const { password } = req.body;
        const config = await getProjectData();
        
        if (String(password) === String(config.adminSecret)) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid password' });
        }
    } catch {
        res.status(500).json({ success: false, message: 'Server error during auth' });
    }
});

// Production: Serve static files
const DIST_PATH = path.join(__dirname, 'dist');
app.use(express.static(DIST_PATH));

// SPA fallback: Serve index.html for any unknown routes
app.use(async (req, res) => {
    const indexPath = path.join(DIST_PATH, 'index.html');
    try {
        await fs.access(indexPath);
        res.sendFile(indexPath);
    } catch {
        res.status(404).send('Frontend build not found. Please run "npm run build" first.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
