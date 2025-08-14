// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate-map', async (req, res) => {
  const { topic, text } = req.body;
  
  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // 1. Abre DeepSeek Chat
    await page.goto('https://www.deepseek.com/chat', { waitUntil: 'networkidle2' });
    
    // 2. Escribe el prompt y envía
    const prompt = `Genera un mapa mental en JSON para React Flow sobre "${topic || text.slice(0, 100)}". 
                   Usa este formato exacto: 
                   { "nodes": [{"id": "1", "data": {"label": "Nodo raíz"}, "position": {"x": 250, "y": 50}}], "edges": [] }.
                   Devuelve SOLO el JSON sin explicaciones.`;
    
    await page.type('#chat-input', prompt);
    await page.click('#send-button');
    
    // 3. Espera y captura la respuesta
    await page.waitForSelector('.ai-message:last-child', { timeout: 30000 });
    const response = await page.evaluate(() => {
      return document.querySelector('.ai-message:last-child').textContent;
    });
    
    await browser.close();
    res.json(JSON.parse(response.trim()));
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al generar el mapa. Intenta de nuevo." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));