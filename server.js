import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use Vite middleware in development
  let vite;
  if (process.env.NODE_ENV !== 'production') {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
  }

  // Handle all other routes by serving index.html with environment variable injection
  app.get('*', async (req, res) => {
    try {
      let indexPath;
      let data;

      if (process.env.NODE_ENV !== 'production') {
        // In development, we read from the root index.html
        indexPath = path.join(__dirname, 'index.html');
        data = await fs.promises.readFile(indexPath, 'utf8');
        // Transform index.html through Vite (handles HMR scripts etc)
        data = await vite.transformIndexHtml(req.originalUrl, data);
      } else {
        indexPath = path.join(__dirname, 'dist', 'index.html');
        data = await fs.promises.readFile(indexPath, 'utf8');
      }

      // Inject API Key from runtime environment
      // We look for the placeholder in index.html and replace it
      const geminiApiKey = process.env.GEMINI_API_KEY || '';
      const result = data.replace(
        "window.process = { env: { GEMINI_API_KEY: '' } };",
        `window.process = { env: { GEMINI_API_KEY: '${geminiApiKey}' } };`
      );

      res.status(200).set({ 'Content-Type': 'text/html' }).end(result);
    } catch (e) {
      console.error('Error serving index.html:', e);
      res.status(500).end(e.message);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();