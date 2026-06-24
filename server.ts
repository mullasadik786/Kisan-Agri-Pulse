import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. MeeBhoomi Land Registry Sync Endpoint
app.post('/api/meebhoomi/sync', (req: Request, res: Response) => {
    const { farmerId, surveyNumber } = req.body;
    
    if (!farmerId || !surveyNumber) {
        return res.status(400).json({ success: false, message: 'Farmer ID and Survey Number are required.' });
    }

    // Simulated MeeBhoomi & AgriStack DB Lookup
    return res.status(200).json({
        success: true,
        matched: true,
        data: {
            farmerName: "Y. Prasad Rao",
            district: "Nellore",
            surveyNo: "442-A/1",
            khatauniId: "90283",
            landArea: "1.8 Hectares (~4.4 Acres)",
            ccrcStatus: "Tenant Verification Pending"
        }
    });
});

// 2. IMD Weather Block Alert Endpoint
app.get('/api/weather/alert', (req: Request, res: Response) => {
    return res.status(200).json({
        block: "Nellore-Sadar",
        alertActive: true,
        severity: "High",
        message: "Unseasonal heavy showers mapped this week. Delayed chemical inputs advised immediately by block agronomist offset."
    });
});

// 3. Kisan-AgriPulse AI Mitra Multilingual Chat Endpoint
app.post('/api/ai-mitra/chat', (req: Request, res: Response) => {
    const { message, language } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message context is required.' });
    }

    // Smart Router based on user prompts
    let reply = "Namaste! I am Kisan-AgriPulse Mitra. How can I help you today?";
    if (language === 'te' || message.includes('????') || message.includes('CCRC')) {
        reply = "?????? ??????? ???? ????, ?? CCRC ???? ????? ????????? ????????? ????. ??? ???????? ?????? '??????? ??????' ???? ?????? ????????? ???? ?? ?????? ?? ???????????.";
    }

    return res.status(200).json({ reply });
});

app.listen(PORT, () => {
    console.log(`?? Kisan-AgriPulse Engine running on port ${PORT}`);
});
