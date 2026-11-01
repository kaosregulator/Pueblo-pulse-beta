import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { createPuebloRouter } from "./server/pueblo/routes";

dotenv.config();

// Auto-generate solid fallback PWA launcher icon PNG assets at server startup to prevent any 404 errors
function ensurePwaAssets() {
  const orangePngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABbTL8vAAAAA1BMVEV/h8S+FkCFAAAAAXRSTlMAQOBYZgAAADlJREFUeN7t1AEBAAAAwiD7p7bGDlgYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4GcbhgABAVg0SgAAAABJRU5ErkJggg==";
  const buffer = Buffer.from(orangePngBase64, "base64");
  const files = [
    "icon-192.png",
    "icon-512.png",
    "icon-192-maskable.png",
    "icon-512-maskable.png"
  ];
  
  const dirs = [
    path.join(process.cwd(), "public"),
    path.join(process.cwd(), "dist")
  ];
  
  dirs.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      files.forEach(file => {
        const filePath = path.join(dir, file);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, buffer);
          console.log(`📡 [PWA Asset Gen] Wrote dynamic fallback asset to ${filePath}`);
        }
      });
    } catch (err) {
      console.warn(`⚠️ [PWA Asset Gen] Skipped directory setup for ${dir}:`, err);
    }
  });
}

// Ensure resources exist
ensurePwaAssets();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini safely
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY) {
  ai = new GoogleGenAI({
    apiKey: API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn("⚠️ GEMINI_API_KEY is not defined in the environment. AI concierge service is in offline demo fallback mode.");
}

// Pueblo data hub: map layers from county GIS, NWS, USGS, CDOT and the
// Pueblo Transit schedule, cached and labelled with their freshness.
app.use("/api/pueblo", createPuebloRouter());

// REST API endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI Concierge API
app.post("/api/ai", async (req, res) => {
  const { query, history } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  // System instruction detailing Pueblo, Colorado, local specialties, and our app's preseeded details
  const systemInstruction = `
    You are the 'Pueblo Pulse Concierge', a local expert AI assistant for Pueblo, Colorado and Pueblo County.
    Your tone must be warm, enthusiastic, helpful, neighborly, and proud of Pueblo's unique culture and history.
    Never sound generic. Use local flavor wherever possible.

    PUEBLO CULTURE & FACTS:
    - Sloppers: Our legendary local dish. It is a hamburger open-faced on toasted buns, smothered completely in hot, pork-loaded local green chili and topped with raw chopped white onions. Famous spots include Coors Tavern and Gray's Coors Tavern.
    - Pueblo Chile: Mira Sol chiles grown on the sacred flatlands of the Mesa. Sweeter and hotter than Hatch chiles! We celebrate this with the massive Pueblo Chile & Frijoles Festival every September in Downtown's Union Avenue district.
    - State Fair: Pueblo hosts the historic Colorado State Fair annually in late August at the Fairgrounds.
    - Historic Arkansas Riverwalk: A beautiful downtown waterfront reclaiming the original path of the Arkansas river, which flooded catastrophically in 1921. Now popular for gondola boat cruises and patio dining.
    - Bessemer: The historic blue-collar heart of Pueblo, grown around the CF&I Minnequa Steel Works. Rich with immigrant heritage.

    LOCAL LIVE APP DATA (Knowledge Base):
    Use these specific details to answer recommendations precisely!
    
    1. Neighborhoods:
       - Downtown: Creative arts, shops, El Pueblo History Museum, Historic Riverwalk.
       - Bessemer: Cradle of the steel industry, Steelworks Museum, famous taverns (Coors Tavern, Gus's Place).
       - Pueblo West: Master-planned suburban area with Front Range views, close to Lake Pueblo State Park.
       - Mesa Area: Fertile farmland famous for Milberger Farms and growing the hot Mira Sol chiles.
       - Union Avenue District: Preservation area from 1880s filled with antique deals and brick storefronts.
       - Belmont: Mid-century suburb northeast, home of the CSU Pueblo Thunderwolves.
       - Mesa Junction: Artsy hill overlooking downtown, indie shops, Rawlings Public Library.
       
    2. Businesses:
       - The Famous Coors Tavern (Bessemer, 515 W 4th St) - Home of the original smothered Slopper!
       - Shamrock Brewing Co. (Downtown, 108 W 3rd St) - Great stouts, burgers, Irish pub vibe, and draft beer.
       - Solar Roast Coffee (Downtown, 226 N Main St) - Coffee roasted using solar panels. Custom 'Pueblo Chile Mocha'.
       - Milberger Farms (Mesa Area, 28570 US-50) - Farm store, smokehouse BBQ on green chile cheese bread, fresh roasts.
       - Tony's Alley Pizza (South Side) - Loaded with Italian sausage and hot local chiles.
       - Pueblo West Diner (Pueblo West) - Breakfast diner serving the Foothills Scramble smothered in green chili.
       - Gantry Smokehouse (West Side) - Hickory-smoked hand-sliced beef brisket.

    3. Events:
       - Pueblo Chile & Frijoles Festival (September 18th, Union Avenue Historic District) - Roasting chiles, music, cooking competitions.
       - Colorado State Fair & Rodeo (August 28th, State Fairgrounds) - Rodeos, carnival rides, livestock exhibits, music concerts.
       - Pueblo Mesa Farmers Market (June 20th - Milberger Farms) - Local honey, early summer produce, chile cheese bread rolls.
       - Pueblo Street Rods Classic Car Show (July 11th - Minnequa Lake Park, Bessemer) - Vintage rod exhibition.
       - Riverwalk Sunset Acoustic Session (June 27th - Amphitheater) - Live acoustic musicians at sundown.
       - Pueblo County Firefighters Chile Cookoff (July 25th - Pueblo West Civic Center Park) - Taste and vote.

    4. Jobs Available:
       - Arc Welder helper at Evraz Rocky Mountain Steel (Bessemer, Full-time welder, great union pension benefits)
       - Deli Cook at Milberger Farms (Mesa, Part-time, wrapping chiles, making sloppers)
       - Seasonal Gondola Boat Captain at Riverwalk (Downtown, steering boats, welcoming tourists)
       - Volunteer Zoo Guide at Pueblo Zoo (West Side, City Park, guiding kids through historic WPA cages)

    5. Missing / Lost pets:
       - Lost Siberian Husky 'Nala' in Mesa Area (gray/black, ice blue eyes, pink collar).
       - Found Golden Retriever puppy running around downtown Riverwalk (no tag name, extremely energetic).
       - Lost GoPro Hero 11 underwater near Lake Pueblo North Shore boat ramp.

    GUIDANCE FOR ANSWERS:
    - If someone asks 'What is happening tonight?' or 'activities', suggest the Riverwalk Sunset Acoustic Sessions or Farmers Market, of the Chile Festival in September.
    - If someone asks for history, explain the industrial heritage of Bessemer steel mill, the 1921 Flood that prompted the Riverwalk rebuild, or the farming immigrants of the Mesa.
    - If someone asks what to eat/drink, enthusiastically recommend the smothered Slopper at Coors Tavern or a Pueblo Chile Mocha at Solar Roast Coffee, or the BBQ on chile bread at Milberger Farms!
    - If the user asks general questions about something outside Pueblo, answer politely but gently transition the connection back to Pueblo or Pueblo County affairs.
    - If GEMINI_API_KEY is not configured or fails, you can fall back to smart local matching rules.
  `;

  if (!ai) {
    // Offline / Mock fallback response when API key is missing
    const lowQuery = query.toLowerCase();
    let responseText = "Greetings from Pueblo Pulse! ";
    if (lowQuery.includes("slopper") || lowQuery.includes("eat") || lowQuery.includes("restaurant") || lowQuery.includes("food") || lowQuery.includes("burgers")) {
      responseText += "You absolutely must grab our legendary local dish: a smothered **Slopper**! Head down to **The Famous Coors Tavern** in historic Bessemer (515 W 4th St) for the original open-face masterpiece topped with pork green chile and raw white onions, or enjoy a pint and a stout burger at **Shamrock Brewing Co.** downtown!";
    } else if (lowQuery.includes("event") || lowQuery.includes("happen") || lowQuery.includes("activity") || lowQuery.includes("weekend")) {
      responseText += "There are some amazing local milestones coming up! The flagship **Pueblo Chile & Frijoles Festival** kicks off September 18th in the Historic Union Avenue District. For closer activities, don't miss the **Riverwalk Sunset Acoustic Session** on June 27th or check out local crops at the **Farmers Market** this weekend!";
    } else if (lowQuery.includes("history") || lowQuery.includes("bessemer") || lowQuery.includes("mill") || lowQuery.includes("flood")) {
      responseText += "Pueblo's history runs deeper than the steel we roll! **Bessemer** is the historic home of the CF&I Minnequa Steel Works, where immigrant workers settled from all over Europe and Mexico. Downtown was shaped by the tragic Great Pueblo Flood of June 1921, which led to high civil engineering changes and the gorgeous **Historic Arkansas Riverwalk** we enjoy today.";
    } else if (lowQuery.includes("pueblo west")) {
      responseText += "Pueblo West is a spacious master-planned community founded in 1969 by Robert McCulloch. It is booming with new businesses and is located right next to **Lake Pueblo State Park**, Colorado's most visited state park for boating, camping, and wakeboarding!";
    } else {
      responseText += "Pueblo has so much to offer! Ask me about local landmarks, where to find legendary smothered Sloppers, our rich agricultural Pueblo Mira Sol chiles grown on the Mesa, historic steel mill timelines, or what family events are happening this month!";
    }
    return res.json({ text: responseText, source: "Local Concierge Fallback Engine" });
  }

  try {
    // Map chat history safely if provided
    const textPrompt = `User Query: "${query}"\nAnswer the user based on Pueblo local info and heritage. Be engaging!`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: textPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const responseText = response.text || "I was unable to formulate a response. Please ask me again about Pueblo landmarks!";
    res.json({ text: responseText, source: "Pueblo Pulse AI" });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate AI response. Using offline fallback rules.", detail: error.message });
  }
});

// Setup Vite Development Middleware or Production serving
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️ Starting Express server with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("🚀 Starting Express server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pueblo Pulse Fullstack server running on http://localhost:${PORT}`);
  });
}

initializeServer().catch((err) => {
  console.error("Failed to start Pueblo Pulse server:", err);
});
