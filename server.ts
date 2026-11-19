import {spawn} from 'node:child_process';
import express from 'express';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PYTHON_SERVICE = path.resolve(__dirname, 'backend', 'portfolio_service.py');
const PORT = Number(process.env.PORT) || 3000;

interface PythonServiceResult {
  code: number;
  stdout: string;
  stderr: string;
}

function runPythonService(command: string, stdinPayload?: string): Promise<PythonServiceResult> {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', [PYTHON_SERVICE, command], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf-8');
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf-8');
    });
    child.on('error', reject);
    child.on('close', (code) => {
      resolve({code: code ?? 1, stdout, stderr});
    });

    if (stdinPayload !== undefined) {
      child.stdin.write(stdinPayload, 'utf-8');
    }
    child.stdin.end();
  });
}

async function createServer() {
  const app = express();
  app.use(express.json({limit: '1mb'}));

  app.get('/api/messages', async (_req, res) => {
    try {
      const result = await runPythonService('list');
      if (result.code === 0) {
        const messages = JSON.parse(result.stdout || '[]');
        res.json(messages);
        return;
      }
      res.status(500).json({success: false, message: 'Failed to load messages.'});
    } catch {
      res.status(500).json({success: false, message: 'Python backend error.'});
    }
  });

  app.post('/api/contact', async (req, res) => {
    try {
      const result = await runPythonService('add', JSON.stringify(req.body ?? {}));
      const parsed = JSON.parse(result.stdout || '{}');
      if (result.code === 0) {
        res.status(201).json(parsed);
        return;
      }
      if (result.code === 2) {
        res.status(400).json(parsed);
        return;
      }
      res.status(500).json({success: false, message: 'Failed to save message.'});
    } catch {
      res.status(500).json({success: false, message: 'Python backend error.'});
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'mpa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer();
