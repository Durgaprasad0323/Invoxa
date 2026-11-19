/**
 * INVOICE TEMPLATE ENGINE & RENDERER
 * Complete port of the 10-Layout, 64-Palette, 36-Font Pair, 10-Language Template Library
 */

export const STYLES = [
  { id: "studio", name: "Teal Studio", cat: "Creative", ind: "Interiors", biz: "Sharma Interiors", logo: "SI", city: "Pune, Maharashtra", gstin: "27AABCS1429R1Z5", pos: "Maharashtra (27)", fd: "Fraunces", fb: "Manrope", ink: "#13211F", acc: "#0E5E5A", acc2: "#3FA79B", soft: "#E6F2F0", art: "waves",
    client: "Mehta Homes", ccity: "Baner, Pune, Maharashtra", cg: "27AAFCM7731K1Z2", gst: 18, intra: true, po: "WO-2026-118", adv: 30000,
    items: [["Kitchen design", "998391", 1, 60000, "job"], ["3D renders", "998391", 4, 3000, "nos"], ["Site supervision", "998391", 1, 8000, "month"]], sign: "Priya Sharma", upi: "sharmainteriors@okhdfc", bank: ["HDFC Bank", "50200012345678", "HDFC0001234"], lay: ["band", "split"] },
  { id: "ledger", name: "Navy Ledger", cat: "Professional", ind: "Chartered accountants", biz: "Iyer & Associates", logo: "IA", city: "Chennai, Tamil Nadu", gstin: "33AAFFI2210L1Z1", pos: "Tamil Nadu (33)", fd: "Libre Baskerville", fb: "IBM Plex Sans", fn: "IBM Plex Mono", ink: "#141A33", acc: "#1F2A5C", acc2: "#8EA2D8", soft: "#EEF1F8", art: "none",
    client: "Nova Retail Pvt Ltd", ccity: "T. Nagar, Chennai, Tamil Nadu", cg: "33AACCN4471P1Z9", gst: 18, intra: true, po: "PO/NR/2611",
    items: [["Statutory audit FY 25-26", "998221", 1, 150000, "job"], ["GST return filing", "998231", 12, 4000, "month"], ["Advisory", "998222", 5, 3000, "hrs"]], sign: "R. Iyer", upi: "iyerassociates@okicici", bank: ["ICICI Bank", "602105004321", "ICIC0006021"], lay: ["classic", "sidebar"] },
  { id: "hazard", name: "Hazard Bold", cat: "Trades & retail", ind: "Electricians", biz: "Rao Electricals", logo: "RE", city: "Hyderabad, Telangana", gstin: "36AAJFR5521M1Z3", pos: "Telangana (36)", fd: "Archivo", fb: "Archivo", ink: "#111214", acc: "#FFC629", acc2: "#FF8A00", soft: "#FFF6D6", art: "geo",
    client: "Lake View Apartments", ccity: "Kondapur, Hyderabad, Telangana", cg: "", gst: 18, intra: true, po: "Job card 2211",
    items: [["Wiring, 3 flats", "995461", 3, 4000, "flat"], ["MCB distribution panel", "8537", 4, 1000, "nos"], ["Labour and testing", "995461", 1, 2500, "job"]], sign: "K. Rao", upi: "raoelectricals@ybl", bank: ["SBI", "38291045521", "SBIN0020112"], lay: ["band", "hero"] },
  { id: "legal", name: "Quiet Legal", cat: "Professional", ind: "Lawyers", biz: "Mehta Legal", logo: "ML", city: "Mumbai, Maharashtra", gstin: "27AAHFM3301Q1Z7", pos: "Maharashtra (27)", fd: "Cormorant Garamond", fb: "Manrope", ink: "#1B1B1F", acc: "#6C4FD8", acc2: "#C9BFF7", soft: "#F4F2FB", art: "none",
    client: "Orbit Fintech Pvt Ltd", ccity: "BKC, Mumbai, Maharashtra", cg: "27AADCO8812B1Z4", gst: 18, intra: true, po: "Matter OF-0912",
    items: [["Contract review", "998212", 1, 90000, "job"], ["Advisory", "998212", 10, 6000, "hrs"], ["Regulatory filing", "998213", 1, 15000, "job"]], sign: "Anika Mehta", upi: "mehtalegal@okaxis", bank: ["Axis Bank", "921020045678123", "UTIB0000231"], lay: ["minimal", "editorial"] },
  { id: "festive", name: "Saffron Festive", cat: "Festive", ind: "Caterers & events", biz: "Annapurna Caterers", logo: "AC", city: "Jaipur, Rajasthan", gstin: "08AAPFA6620D1Z8", pos: "Rajasthan (08)", fd: "Playfair Display", fb: "Poppins", ink: "#2A1410", acc: "#B3261E", acc2: "#F2A93B", soft: "#FFF3E0", art: "mandala", occ: "diwali",
    client: "Agarwal Family Wedding", ccity: "C-Scheme, Jaipur, Rajasthan", cg: "", gst: 5, intra: true, po: "Event 18 Nov, Rambagh", adv: 50000,
    items: [["Wedding buffet", "996334", 250, 650, "plates"], ["Live chaat counter", "996334", 1, 18000, "counter"], ["Decor and service staff", "998596", 1, 25000, "event"]], sign: "Suresh Sharma", upi: "annapurna@okhdfc", bank: ["Bank of Baroda", "29850100004412", "BARB0CSCHEM"], lay: ["frame", "band"] },
  { id: "glow", name: "Sky Clinic", cat: "Creative", ind: "Skin & wellness", biz: "Glow Skin Studio", logo: "GS", city: "Bengaluru, Karnataka", gstin: "29AAKFG2290H1Z6", pos: "Karnataka (29)", fd: "Outfit", fb: "Outfit", ink: "#112235", acc: "#1D7FD6", acc2: "#7CC6F5", soft: "#E8F3FC", art: "blobs",
    client: "Riya Menon", ccity: "Indiranagar, Bengaluru, Karnataka", cg: "", gst: 18, intra: true, po: "Client ID GS-482",
    items: [["Laser session", "999722", 3, 4500, "session"], ["Hydra facial", "999722", 1, 3500, "session"], ["Skincare kit", "3304", 1, 2400, "kit"]], sign: "Dr. Neha Rao", upi: "glowskin@okicici", bank: ["Kotak Bank", "4512889032", "KKBK0008043"], lay: ["cards", "hero"] },
  { id: "coral", name: "Coral Lens", cat: "Creative", ind: "Photographers", biz: "Frame & Field", logo: "FF", city: "Panaji, Goa", gstin: "30AAQFF9013C1Z2", pos: "Maharashtra (27)", fd: "Syne", fb: "DM Sans", ink: "#22110D", acc: "#E8553E", acc2: "#FFB199", soft: "#FFF0EB", art: "terrazzo",
    client: "Kapoor & Shah", ccity: "Bandra, Mumbai, Maharashtra", cg: "27AAGPK1123E1Z5", gst: 18, intra: false, po: "Booking FF-118", adv: 20000,
    items: [["Pre-wedding shoot", "998386", 1, 45000, "day"], ["Edited photos", "998386", 120, 150, "nos"], ["Printed album", "4911", 1, 12000, "nos"]], sign: "Arjun D'Souza", upi: "frameandfield@ybl", bank: ["HDFC Bank", "50100223344556", "HDFC0000412"], lay: ["split", "editorial"] },
  { id: "forest", name: "Forest Organic", cat: "Trades & retail", ind: "Organic wholesale", biz: "Bhoomi Organics", logo: "BO", city: "Bengaluru, Karnataka", gstin: "29AAMFB4410J1Z0", pos: "Karnataka (29)", fd: "DM Serif Display", fb: "Karla", ink: "#17241A", acc: "#2F5D3A", acc2: "#A9C79A", soft: "#EEF4EA", art: "topo",
    client: "Green Bowl Café", ccity: "Koramangala, Bengaluru, Karnataka", cg: "29AAHCG5521A1Z3", gst: 5, intra: true, po: "PO-GB-0441", disc: 5, ship: "Green Bowl Café, 80 Ft Rd, Koramangala", eway: "3410 2291 8875", veh: "KA-05-MN-4421",
    items: [["Cold-pressed groundnut oil", "1508", 40, 1450, "5L can"], ["Millet mix", "1008", 25, 220, "kg"], ["Delivery", "996812", 1, 500, "trip"]], sign: "Lakshmi N.", upi: "bhoomiorganics@okaxis", bank: ["Canara Bank", "0412201009988", "CNRB0000412"], lay: ["sidebar", "receipt"] },
  { id: "tech", name: "Electric Tech", cat: "Professional", ind: "IT services", biz: "Kodeleaf Technologies", logo: "KL", city: "Bengaluru, Karnataka", gstin: "29AAICK7781F1Z4", pos: "Maharashtra (27)", fd: "Bricolage Grotesque", fb: "DM Sans", fn: "JetBrains Mono", ink: "#12142A", acc: "#3A3FE0", acc2: "#00C2A8", soft: "#ECEDFD", art: "geo",
    client: "Pune Mobility Pvt Ltd", ccity: "Hinjewadi, Pune, Maharashtra", cg: "27AAJCP3390D1Z8", gst: 18, intra: false, po: "PO-PM-7781", irn: true,
    items: [["App development, sprint 3", "998314", 1, 180000, "sprint"], ["Cloud hosting", "998315", 3, 8500, "month"], ["Support", "998313", 12, 1500, "hrs"]], sign: "Vikram Iyer", upi: "kodeleaf@okhdfc", bank: ["HDFC Bank", "50200077889900", "HDFC0000521"], lay: ["cards", "minimal"] },
  { id: "boutique", name: "Rose Couture", cat: "Festive", ind: "Fashion boutiques", biz: "Noor Couture", logo: "NC", city: "Lucknow, Uttar Pradesh", gstin: "09AAOFN2231K1Z9", pos: "Uttar Pradesh (09)", fd: "Playfair Display", fdi: true, fb: "Jost", ink: "#2A1520", acc: "#B4436C", acc2: "#E8B4C6", soft: "#FBEEF2", art: "mandala", occ: "eid",
    client: "Zoya Khan", ccity: "Hazratganj, Lucknow, Uttar Pradesh", cg: "", gst: 18, intra: true, po: "Order NC-310", adv: 40000,
    items: [["Bridal lehenga", "6204", 1, 85000, "pc"], ["Embroidered dupatta", "6214", 2, 4500, "pc"], ["Fitting and alterations", "998881", 1, 2500, "job"]], sign: "Noor Fatima", upi: "noorcouture@ybl", bank: ["PNB", "0423002100045612", "PUNB0042300"], lay: ["frame", "split"] },
  { id: "hindi", name: "Indigo Hindi", cat: "Trades & retail", ind: "Kirana & wholesale", biz: "गुप्ता किराना स्टोर", logo: "गु", city: "Varanasi, Uttar Pradesh", gstin: "09AAPFG8812L1Z6", pos: "Uttar Pradesh (09)", fd: "Noto Sans Devanagari", fb: "Noto Sans Devanagari", fn: "Poppins", ink: "#141A3A", acc: "#2B3A8C", acc2: "#F28C28", soft: "#EEF0FA", art: "none", lang: "hi",
    client: "शर्मा जनरल स्टोर", ccity: "लंका, वाराणसी, उत्तर प्रदेश", cg: "09AAKFS2201M1Z1", gst: 5, intra: true, po: "ऑर्डर 118", disc: 2, ship: "गोदाम: लंका, वाराणसी",
    items: [["बासमती चावल", "1006", 2, 2400, "25 kg"], ["तूर दाल", "0713", 3, 1450, "10 kg"], ["देसी घी", "0405", 4, 620, "1 L"]], sign: "Ramesh Gupta", upi: "guptakirana@paytm", bank: ["SBI", "32991100556", "SBIN0001234"], lay: ["classic", "receipt"] },
  { id: "build", name: "Charcoal Build", cat: "Trades & retail", ind: "Contractors", biz: "Patil Constructions", logo: "PC", city: "Nashik, Maharashtra", gstin: "27AAQFP6610B1Z2", pos: "Maharashtra (27)", fd: "Oswald", fb: "Barlow", ink: "#1E2126", acc: "#2D3136", acc2: "#F26B1D", soft: "#F3F1EE", art: "geo",
    client: "Shree Sai Developers", ccity: "Gangapur Rd, Nashik, Maharashtra", cg: "27AAHFS9902C1Z6", gst: 18, intra: true, po: "WO/SSD/2026/14 · RA bill 3", irn: true, ship: "Site: Sai Residency, Plot 22, Gangapur Rd", eway: "2710 4482 1193", veh: "MH-15-GT-7712", adv: 200000,
    items: [["RCC slab work", "995411", 1200, 180, "sq ft"], ["Internal plastering", "995454", 1, 85000, "job"], ["Site materials", "2523", 150, 410, "bags"]], sign: "Sanjay Patil", upi: "patilconstructions@okhdfc", bank: ["Bank of Maharashtra", "60112233445", "MAHB0000431"], lay: ["hero", "classic"] },
  { id: "hotel", name: "Backwater Stay", cat: "Creative", ind: "Hotels & homestays", biz: "Kayal Homestay", logo: "KH", city: "Alappuzha, Kerala", gstin: "32AAJFK4411P1Z3", pos: "Kerala (32)", fd: "Marcellus", fb: "Karla", ink: "#10282B", acc: "#0F6E7A", acc2: "#C9A227", soft: "#E7F1F2", art: "waves",
    client: "Anand & Meera Joshi", ccity: "Kothrud, Pune, Maharashtra", cg: "", gst: 5, intra: true, po: "Booking KH-2611 · 3 nights", adv: 5000,
    items: [["Deluxe lake-view room", "996311", 3, 4500, "nights"], ["Kerala breakfast", "996331", 6, 350, "plates"], ["Backwater canoe tour", "998555", 1, 2500, "trip"]], sign: "Thomas Kurian", upi: "kayalhomestay@okaxis", bank: ["Federal Bank", "14020100088812", "FDRL0001402"], lay: ["split", "frame"] },
  { id: "coach", name: "Bright Academy", cat: "Professional", ind: "Coaching & education", biz: "Bright Minds Academy", logo: "BM", city: "Kota, Rajasthan", gstin: "08AAKFB7720E1Z4", pos: "Rajasthan (08)", fd: "Lexend", fb: "Lexend", ink: "#0F1A33", acc: "#1F5FBF", acc2: "#F2B33D", soft: "#E8F0FB", art: "blobs",
    client: "Aarav Mehta (parent: Rakesh Mehta)", ccity: "Talwandi, Kota, Rajasthan", cg: "", gst: 18, intra: true, po: "Roll no. JEE-26-1148 · Term 2",
    items: [["JEE foundation course", "999293", 1, 45000, "term"], ["Weekly test series", "999293", 12, 500, "tests"], ["Doubt-clearing sessions", "999293", 8, 750, "sessions"]], sign: "Dr. S. Agarwal", upi: "brightminds@okicici", bank: ["ICICI Bank", "123405008877", "ICIC0001234"], lay: ["hero", "cards"] },
  { id: "pharma", name: "Care Pharmacy", cat: "Trades & retail", ind: "Pharmacies", biz: "Sanjeevani Medicals", logo: "SM", city: "Indore, Madhya Pradesh", gstin: "23AAKFS3390G1Z8", pos: "Madhya Pradesh (23)", fd: "Sora", fb: "DM Sans", ink: "#0E2A26", acc: "#0B8A74", acc2: "#7FD3C1", soft: "#E6F5F2", art: "none",
    client: "Mr. R. Verma", ccity: "Vijay Nagar, Indore, Madhya Pradesh", cg: "", gst: 5, intra: true, po: "Rx Dr. P. Jain · DL 20B-INR-4411",
    items: [["Paracetamol 650 · Batch PC2291 · Exp 08/27", "3004", 4, 30, "strips"], ["Vitamin D3 60K · Batch VD118 · Exp 03/28", "3004", 2, 120, "strips"], ["Digital BP monitor · Sr. BP8812", "9018", 1, 1850, "pc"]], sign: "R. Shah, Pharmacist", upi: "sanjeevani@paytm", bank: ["SBI", "39900112233", "SBIN0030112"], lay: ["classic", "receipt"] },
  { id: "jewel", name: "Gold Heritage", cat: "Festive", ind: "Jewellers", biz: "Soni Jewellers", logo: "SJ", city: "Surat, Gujarat", gstin: "24AAPFS8812H1Z2", pos: "Gujarat (24)", fd: "Yeseva One", fb: "Josefin Sans", ink: "#1A1408", acc: "#141414", acc2: "#C9A54B", soft: "#F6F1E4", art: "mandala",
    client: "Kavya Patel", ccity: "Adajan, Surat, Gujarat", cg: "", gst: 3, intra: true, po: "Order SJ-0921 · BIS hallmarked",
    items: [["22K gold necklace · 18.40 g net · HUID 7K2P9Q", "7113", 1, 128800, "pc"], ["Making charges", "7113", 1, 9200, "pc"], ["Hallmarking", "7113", 1, 45, "pc"]], sign: "Jignesh Soni", upi: "sonijewellers@okhdfc", bank: ["Kotak Bank", "8812004455", "KKBK0002881"], lay: ["frame", "editorial"] },
  { id: "freight", name: "Road Freight", cat: "Trades & retail", ind: "Transport & logistics", biz: "Shiv Shakti Roadlines", logo: "SS", city: "Ludhiana, Punjab", gstin: "03AAKFS6620L1Z5", pos: "Maharashtra (27)", fd: "Archivo", fb: "IBM Plex Sans", fn: "IBM Plex Mono", ink: "#1C1410", acc: "#E5541E", acc2: "#FFB020", soft: "#FDEDE5", art: "geo",
    client: "Deccan Auto Parts Pvt Ltd", ccity: "Chakan, Pune, Maharashtra", cg: "27AAHCD4410K1Z9", gst: 5, intra: false, po: "LR 4471 · 9 t · Ludhiana → Pune", eway: "0310 7782 4419", veh: "PB-10-HK-6612", ship: "Plant 2, MIDC Chakan, Pune",
    items: [["Freight, full truck load", "996511", 1, 62000, "trip"], ["Loading and unloading", "996719", 1, 3500, "job"], ["Detention (1 day)", "996511", 1, 2500, "day"]], sign: "Gurpreet Singh", upi: "shivshaktiroadlines@okaxis", bank: ["Punjab & Sind Bank", "05941100012345", "PSIB0000594"], lay: ["band", "sidebar"] },
  { id: "mfg", name: "Precision Steel", cat: "Trades & retail", ind: "Manufacturers", biz: "Precision Auto Components Pvt Ltd", logo: "PA", city: "Chakan, Pune, Maharashtra", gstin: "27AAKCP1234Q1Z6", pos: "Gujarat (24)", fd: "Archivo", fb: "IBM Plex Sans", fn: "IBM Plex Mono", ink: "#141821", acc: "#1F3A5F", acc2: "#F2A93B", soft: "#EEF2F7", art: "none",
    client: "Sanand Motors India Pvt Ltd", ccity: "Sanand, Gujarat", cg: "24AADCS5521M1Z3", gst: 18, intra: false, po: "SM/PO/26/8812", irn: true, items: [], sign: "Rahul Kulkarni", upi: "precisionauto@okhdfc", bank: ["HDFC Bank", "50200099887766", "HDFC0000876"], lay: ["classic", "sidebar"] }
];

export const INDUSTRIES = [
  { id: "photo", name: "Photographer / videographer", s: "coral", l: "split", art: "terrazzo", tb: "clean", cols: { item: "Service" }, msg: "review", qr: "dots", stamp: "off", lvl: "1", why: "Bold split header shows off creative work; review QR brings new clients" },
  { id: "ca", name: "Chartered accountant", s: "ledger", l: "classic", art: "none", tb: "boxed", cols: { item: "Particulars" }, msg: "none", qr: "classic", stamp: "#1E3A8A", lvl: "2", why: "Formal and structured with every detail visible; blue office stamp" },
  { id: "interior", name: "Interior designer / architect", s: "studio", l: "band", art: "waves", tb: "zebra", cols: { item: "Work" }, msg: "review", qr: "dots", stamp: "brand", lvl: "1", why: "Elegant serif and brand band; advance and balance shown clearly" },
  { id: "law", name: "Lawyer / legal", s: "legal", l: "minimal", art: "none", tb: "none", cols: { item: "Matter" }, msg: "none", qr: "classic", stamp: "#5B21B6", lvl: "1", why: "Quiet and premium, with lots of white space" },
  { id: "cater", name: "Caterer / events", s: "festive", l: "frame", art: "mandala", tb: "round", cols: { qty: "Plates", rate: "Per plate" }, msg: "review", qr: "dots", stamp: "#B91C1C", lvl: "1", occ: "diwali", why: "Festive frame and rangoli art; plates and per-plate columns" },
  { id: "salon", name: "Salon / skin clinic", s: "glow", l: "cards", art: "blobs", tb: "cards", cols: { item: "Treatment", qty: "Sessions" }, msg: "offer", qr: "dots", stamp: "off", lvl: "1", why: "Soft, friendly cards; next-visit offer brings clients back" },
  { id: "boutique", name: "Boutique / fashion", s: "boutique", l: "frame", art: "mandala", tb: "clean", cols: { item: "Outfit" }, msg: "offer", qr: "dots", stamp: "brand", lvl: "1", why: "Luxury frame and italic serif; coupon for the next order" },
  { id: "wholesale", name: "Wholesale / distributor", s: "forest", l: "sidebar", art: "topo", tb: "zebra", cols: {}, msg: "none", qr: "classic", stamp: "#1E3A8A", lvl: "2", why: "Complete details: ship-to, e-way bill, vehicle and discount" },
  { id: "mfg", name: "Manufacturer", s: "mfg", l: "classic", art: "none", tb: "boxed", cols: {}, msg: "none", qr: "classic", stamp: "#1E3A8A", lvl: "2", why: "Bill-to and ship-to, e-way bill, transporter, 6-digit HSN summary and e-invoice IRN" },
  { id: "it", name: "IT / software company", s: "tech", l: "cards", art: "geo", tb: "round", cols: { item: "Deliverable" }, msg: "none", qr: "brand", stamp: "off", lvl: "2", why: "Modern cards with IGST and e-invoice IRN shown" },
  { id: "agency", name: "Freelancer / agency", s: "tech", l: "editorial", art: "none", tb: "clean", cols: { item: "Deliverable", qty: "Hours" }, msg: "social", qr: "dots", stamp: "off", lvl: "1", fp: ["Instrument Serif", "Manrope"], pal: "Ultraviolet", why: "Editorial magazine look that feels like a portfolio" },
  { id: "kirana", name: "Kirana / retail shop", s: "hindi", l: "classic", art: "none", tb: "boxed", cols: {}, msg: "thanks", qr: "classic", stamp: "#1E3A8A", lvl: "1", why: "Hindi labels and a clear boxed table; also prints as a thermal receipt" },
  { id: "build", name: "Contractor / construction", s: "build", l: "hero", art: "geo", tb: "boxed", cols: { qty: "Measure" }, msg: "none", qr: "classic", stamp: "#1E3A8A", lvl: "2", why: "Big balance due, running bill, site address and e-way bill" },
  { id: "repair", name: "Electrician / repairs", s: "hazard", l: "band", art: "geo", tb: "zebra", cols: { item: "Job" }, msg: "social", qr: "classic", stamp: "off", lvl: "1", why: "High-contrast bold band, easy to read on a phone at the site" },
  { id: "hotel", name: "Hotel / homestay", s: "hotel", l: "split", art: "waves", tb: "clean", cols: { qty: "Nights", rate: "Per night" }, msg: "review", qr: "dots", stamp: "off", lvl: "1", why: "Calm travel feel; nights and per-night columns; review QR" },
  { id: "coaching", name: "Coaching / education", s: "coach", l: "hero", art: "blobs", tb: "round", cols: { item: "Course" }, msg: "thanks", qr: "dots", stamp: "#1E3A8A", lvl: "1", why: "Friendly, with a clear fee total parents can pay by UPI" },
  { id: "pharmacy", name: "Pharmacy", s: "pharma", l: "classic", art: "none", tb: "zebra", cols: { item: "Medicine" }, msg: "thanks", qr: "classic", stamp: "#1E3A8A", lvl: "1", why: "Batch and expiry on every line; clean and trustworthy" },
  { id: "jeweller", name: "Jeweller", s: "jewel", l: "frame", art: "mandala", tb: "clean", cols: { item: "Ornament" }, msg: "offer", qr: "dots", stamp: "#B91C1C", lvl: "1", why: "Black and gold luxury; HUID and weight on the line" },
  { id: "transport", name: "Transport / logistics", s: "freight", l: "band", art: "geo", tb: "boxed", cols: { item: "Service" }, msg: "none", qr: "classic", stamp: "#1E3A8A", lvl: "2", why: "LR, vehicle, e-way bill and route up front" }
];

export const FORMATS = {
  studio: { doc: "Tax Invoice", ids: "PAN AABCS1429R · Udyam UDYAM-MH-26-0045121", desig: "Principal designer",
    parties: [{ h: "Billed to", n: "Mehta Homes", a: "Baner, Pune, Maharashtra", g: "27AAFCM7731K1Z2", s: "Maharashtra (27)" }, { h: "Project site", n: "Flat 802, Ivy Towers", a: "Baner, Pune 411045" }],
    meta: [["Project", "Kitchen and living room"], ["Work order", "WO-2026-118"], ["Stage", "Design stage 2 of 3"], ["Place of supply", "Maharashtra (27)"], ["Reverse charge", "No"]],
    cols: [["desc", "Work"], ["hsn", "SAC", 0, 1], ["qty", "Qty", "r"], ["rate", "Rate", "r"], ["amt", "Amount", "r"]],
    rows: [{ desc: "Kitchen design", sub: "Layouts, elevations, material board", hsn: "998391", qty: 1, unit: "job", rate: 60000, gst: 18 }, { desc: "3D renders", hsn: "998391", qty: 4, unit: "nos", rate: 3000, gst: 18 }, { desc: "Site supervision", sub: "October 2026", hsn: "998391", qty: 1, unit: "month", rate: 8000, gst: 18 }],
    notes: ["Advance of ₹30,000 received on 12 Oct 2026 is adjusted below.", "Design files are handed over after full payment."] },
  ledger: { doc: "Tax Invoice · Professional Fees", ids: "ICAI FRN 012345S · M. No. 214567 · PAN AAFFI2210L", desig: "Partner", stampLbl: "CHARTERED ACCTS",
    parties: [{ h: "Client", n: "Nova Retail Pvt Ltd", a: "T. Nagar, Chennai, Tamil Nadu", g: "33AACCN4471P1Z9", s: "Tamil Nadu (33)" }],
    meta: [["Engagement", "Statutory audit and GST compliance"], ["Period", "FY 2025-26"], ["Engagement letter", "EL/NR/2026/04"], ["Place of supply", "Tamil Nadu (33)"], ["Reverse charge", "No"]],
    cols: [["desc", "Particulars"], ["hsn", "SAC", 0, 1], ["qty", "Qty", "r"], ["rate", "Fee", "r"], ["amt", "Amount", "r"]],
    rows: [{ desc: "Statutory audit FY 2025-26", sub: "As per engagement letter", hsn: "998221", qty: 1, unit: "job", rate: 150000, gst: 18 }, { desc: "GST return filing", sub: "GSTR-1 and GSTR-3B, Apr 2025 – Mar 2026", hsn: "998231", qty: 12, unit: "month", rate: 4000, gst: 18 }, { desc: "Advisory", hsn: "998222", qty: 5, unit: "hrs", rate: 3000, gst: 18 }],
    notes: ["TDS under section 194J may be deducted; please share Form 16A.", "Out-of-pocket expenses, if any, are billed separately."] },
  hazard: { doc: "Tax Invoice", ids: "Licensed electrical contractor · Lic. TS/EC/2291", desig: "Proprietor",
    parties: [{ h: "Billed to", n: "Lake View Apartments Welfare Assn.", a: "Kondapur, Hyderabad, Telangana" }, { h: "Site", n: "Blocks B and C", a: "Lake View Apartments, Kondapur" }],
    meta: [["Job card", "JC-2211"], ["Work date", "02 Nov 2026"], ["Technician", "S. Naresh"], ["Warranty", "6 months on workmanship"], ["Reverse charge", "No"]],
    cols: [["desc", "Job"], ["hsn", "HSN/SAC", 0, 1], ["qty", "Qty", "r"], ["rate", "Rate", "r"], ["amt", "Amount", "r"]],
    rows: [{ desc: "Rewiring, 3 flats", sub: "Labour and conduit", hsn: "995461", qty: 3, unit: "flat", rate: 4000, gst: 18 }, { desc: "MCB distribution panel", sub: "8-way, ISI marked", hsn: "8537", qty: 4, unit: "nos", rate: 1000, gst: 18 }, { desc: "Earthing and testing", hsn: "995461", qty: 1, unit: "job", rate: 2500, gst: 18 }],
    notes: ["Parts carry the manufacturer's warranty.", "Faulty parts are replaced free within 30 days."] },
  legal: { doc: "Tax Invoice · Bill of Professional Fees", ids: "Enrolment MAH/2245/2011 · Bar Council of Maharashtra & Goa", desig: "Advocate, Partner", stampLbl: "ADVOCATES", rcm: true,
    parties: [{ h: "Client", n: "Orbit Fintech Pvt Ltd", a: "BKC, Mumbai, Maharashtra", g: "27AADCO8812B1Z4", s: "Maharashtra (27)" }, { h: "Matter", n: "Vendor contract and RBI compliance", a: "Matter ref. OF-0912" }],
    meta: [["Matter ref.", "OF-0912"], ["Period", "October 2026"], ["Place of supply", "Maharashtra (27)"], ["Reverse charge", "Yes"]],
    cols: [["desc", "Particulars"], ["hsn", "SAC", 0, 1], ["qty", "Hours / units", "r"], ["rate", "Rate", "r"], ["amt", "Fees", "r"]],
    rows: [{ desc: "Review and redrafting of vendor master agreement", hsn: "998212", qty: 1, unit: "matter", rate: 90000, gst: 18 }, { desc: "Advisory calls and written opinion", sub: "08, 15 and 22 Oct 2026", hsn: "998212", qty: 10, unit: "hrs", rate: 6000, gst: 18 }, { desc: "Regulatory filing with RBI", hsn: "998213", qty: 1, unit: "filing", rate: 15000, gst: 18 }],
    notes: ["GST on legal services by an advocate or firm of advocates to a business entity is payable by the recipient under reverse charge (Notification 13/2017-Central Tax (Rate), Sl. No. 2).", "Court fees and out-of-pocket expenses are billed at actuals."] },
  festive: { doc: "Tax Invoice", ids: "FSSAI Lic. 12224026000456 · PAN AAPFA6620D", desig: "Proprietor",
    parties: [{ h: "Billed to", n: "Agarwal Family", a: "C-Scheme, Jaipur, Rajasthan" }, { h: "Event venue", n: "Rambagh Gardens", a: "Bhawani Singh Rd, Jaipur" }],
    meta: [["Event", "Wedding reception"], ["Event date", "18 Nov 2026"], ["Guests", "250 pax"], ["Menu", "Royal Rajasthani, veg"], ["Reverse charge", "No"]],
    cols: [["desc", "Service"], ["hsn", "SAC", 0, 1], ["qty", "Plates / units", "r"], ["rate", "Per plate / unit", "r"], ["amt", "Amount", "r"]],
    rows: [{ desc: "Wedding buffet", sub: "Royal Rajasthani menu", hsn: "996334", qty: 250, unit: "plates", rate: 650, gst: 5 }, { desc: "Live chaat counter", hsn: "996334", qty: 1, unit: "counter", rate: 18000, gst: 5 }, { desc: "Decor and service staff", sub: "12 staff, 6 hours", hsn: "996334", qty: 1, unit: "event", rate: 25000, gst: 5 }],
    notes: ["Outdoor catering billed as one composite supply.", "Final plate count as confirmed on the event day; extra plates at ₹650 each."] },
  glow: { doc: "Tax Invoice", ids: "Trade licence BBMP/HL/2291 · PAN AAKFG2290H", desig: "Skin specialist", hsnSum: true,
    parties: [{ h: "Client", n: "Riya Menon", a: "Indiranagar, Bengaluru, Karnataka" }],
    meta: [["Client ID", "GS-482"], ["Visit date", "04 Nov 2026"], ["Therapist", "Ananya K."], ["Next visit", "18 Nov 2026"], ["Reverse charge", "No"]],
    cols: [["desc", "Treatment"], ["hsn", "HSN/SAC", 0, 1], ["qty", "Sessions", "r"], ["rate", "Rate", "r"], ["gst", "GST", "r"], ["amt", "Amount", "r"]],
    rows: [{ desc: "Laser hair reduction", sub: "Package session 3 of 6", hsn: "999722", qty: 3, unit: "session", rate: 4500, gst: 5 }, { desc: "Hydra facial", hsn: "999722", qty: 1, unit: "session", rate: 3500, gst: 5 }, { desc: "Skincare kit", sub: "Sunscreen and serum", hsn: "3304", qty: 1, unit: "kit", rate: 2400, gst: 18 }],
    notes: ["Services and products are taxed at their own rates, shown in the summary.", "Package sessions are valid for 6 months."] },
  coral: { doc: "Tax Invoice", ids: "PAN AAQFF9013C · Udyam UDYAM-GA-01-0004412", desig: "Lead photographer",
    parties: [{ h: "Billed to", n: "Kapoor & Shah", a: "Bandra, Mumbai, Maharashtra", g: "27AAGPK1123E1Z5", s: "Maharashtra (27)" }],
    meta: [["Booking", "FF-118"], ["Shoot date", "26 Oct 2026"], ["Location", "Fort Aguada, Goa"], ["Deliverables", "120 edited photos, album"], ["Place of supply", "Maharashtra (27)"], ["Reverse charge", "No"]],
    cols: [["desc", "Service"], ["hsn", "HSN/SAC", 0, 1], ["qty", "Qty", "r"], ["rate", "Rate", "r"], ["amt", "Amount", "r"]],
    rows: [{ desc: "Pre-wedding shoot", sub: "Full day, 2 photographers", hsn: "998386", qty: 1, unit: "day", rate: 45000, gst: 18 }, { desc: "Edited photos", hsn: "998386", qty: 120, unit: "nos", rate: 150, gst: 18 }, { desc: "Printed album", sub: "12×36 in, 40 pages", hsn: "4911", qty: 1, unit: "nos", rate: 12000, gst: 18 }],
    notes: ["Raw files are not included.", "Copyright stays with Frame & Field; a personal-use licence is granted."] },
  forest: { doc: "Tax Invoice", ids: "FSSAI 11224333000412 · PAN AAMFB4410J", desig: "Partner", hsnSum: true,
    parties: [{ h: "Bill to", n: "Green Bowl Café Pvt Ltd", a: "Koramangala, Bengaluru, Karnataka", g: "29AAHCG5521A1Z3", s: "Karnataka (29)" }, { h: "Ship to", n: "Green Bowl Central Kitchen", a: "80 Ft Rd, Koramangala, Bengaluru", s: "Karnataka (29)" }],
    meta: [["PO no. / date", "PO-GB-0441 · 01 Nov 2026"], ["E-way bill", "3410 2291 8875"], ["Transporter", "Swift Logistics"], ["Vehicle", "KA-05-MN-4421"], ["Place of supply", "Karnataka (29)"], ["Reverse charge", "No"]],
    cols: [["desc", "Item"], ["hsn", "HSN"], ["qty", "Qty", "r"], ["rate", "Rate", "r"], ["disc", "Disc.", "r", 1], ["gst", "GST", "r", 1], ["amt", "Taxable", "r"]],
    rows: [{ desc: "Cold-pressed groundnut oil", sub: "5 L can", hsn: "1508", qty: 40, unit: "can", rate: 1450, disc: 5, gst: 5 }, { desc: "Millet mix", hsn: "1008", qty: 25, unit: "kg", rate: 220, disc: 5, gst: 5 }, { desc: "Jaggery powder", hsn: "1701", qty: 30, unit: "kg", rate: 110, disc: 5, gst: 5 }],
    notes: ["Goods are taken back only if damaged in transit.", "Interest at 18% p.a. on payments after 30 days."] },
  tech: { doc: "Tax Invoice", ids: "CIN U72900KA2019PTC123456 · PAN AAICK7781F", desig: "Director", irn: true,
    parties: [{ h: "Bill to", n: "Pune Mobility Pvt Ltd", a: "Hinjewadi, Pune, Maharashtra", g: "27AAJCP3390D1Z8", s: "Maharashtra (27)" }],
    meta: [["PO / SOW", "PO-PM-7781 · SOW-03"], ["Billing period", "01–31 Oct 2026"], ["Project", "Fleet app v2"], ["Place of supply", "Maharashtra (27)"], ["Reverse charge", "No"]],
    cols: [["desc", "Deliverable"], ["hsn", "SAC", 0, 1], ["qty", "Qty", "r"], ["rate", "Rate", "r"], ["amt", "Amount", "r"]],
    rows: [{ desc: "App development, sprint 3", sub: "Milestone M3 accepted on 30 Oct", hsn: "998314", qty: 1, unit: "sprint", rate: 180000, gst: 18 }, { desc: "Cloud hosting", sub: "Aug – Oct 2026", hsn: "998315", qty: 3, unit: "month", rate: 8500, gst: 18 }, { desc: "Support", hsn: "998313", qty: 12, unit: "hrs", rate: 1500, gst: 18 }],
    notes: ["E-invoice generated on the IRP; the signed QR is on the PDF.", "TDS under section 194J may be deducted."] },
  boutique: { doc: "Tax Invoice", ids: "PAN AAOFN2231K", desig: "Designer and proprietor", hsnSum: true,
    parties: [{ h: "Customer", n: "Zoya Khan", a: "Hazratganj, Lucknow, Uttar Pradesh" }],
    meta: [["Order", "NC-310"], ["Fitting", "10 Nov 2026"], ["Delivery", "15 Nov 2026"], ["Reverse charge", "No"]],
    cols: [["desc", "Outfit"], ["hsn", "HSN/SAC", 0, 1], ["qty", "Qty", "r"], ["rate", "Rate", "r"], ["gst", "GST", "r", 1], ["amt", "Amount", "r"]],
    rows: [{ desc: "Bridal lehenga", sub: "Raw silk, zardozi work", hsn: "6204", qty: 1, unit: "pc", rate: 85000, gst: 18 }, { desc: "Embroidered dupatta", hsn: "6214", qty: 2, unit: "pc", rate: 4500, gst: 18 }, { desc: "Fitting and alterations", hsn: "998821", qty: 1, unit: "job", rate: 2500, gst: 5 }],
    notes: ["Apparel priced above ₹2,500 per piece is taxed at 18%.", "Alterations are free within 7 days of delivery."] },
  hindi: { doc: "Tax Invoice", ids: "FSSAI 22724150000321", desig: "प्रोप्राइटर",
    parties: [{ h: "Billed to", n: "शर्मा जनरल स्टोर", a: "लंका, वाराणसी, उत्तर प्रदेश", g: "09AAKFS2201M1Z1", s: "Uttar Pradesh (09)" }, { h: "Ship to", n: "गोदाम", a: "लंका, वाराणसी" }],
    meta: [["Order", "ऑर्डर 118"], ["Bill type", "Credit · 15 days"], ["Place of supply", "Uttar Pradesh (09)"], ["Reverse charge", "No"]],
    cols: [["desc", "Item"], ["hsn", "HSN", 0, 1], ["qty", "Qty", "r"], ["mrp", "MRP", "r", 1], ["rate", "Rate", "r"], ["disc", "Disc.", "r", 1], ["amt", "Amount", "r"]],
    rows: [{ desc: "बासमती चावल", sub: "25 kg bag", hsn: "1006", qty: 2, unit: "bag", mrp: 2650, rate: 2400, disc: 2, gst: 5 }, { desc: "तूर दाल", sub: "10 kg bag", hsn: "0713", qty: 3, unit: "bag", mrp: 1600, rate: 1450, disc: 2, gst: 5 }, { desc: "देसी घी", sub: "1 L tin", hsn: "0405", qty: 4, unit: "tin", mrp: 690, rate: 620, disc: 2, gst: 5 }],
    notes: ["Goods once sold will not be taken back."] },
  build: { doc: "Tax Invoice · RA Bill No. 3", ids: "PAN AAQFP6610B · Class I registered contractor", desig: "Proprietor", irn: true, adv: 50000, advLbl: "Less: mobilisation advance recovered",
    parties: [{ h: "Bill to", n: "Shree Sai Developers", a: "Gangapur Rd, Nashik, Maharashtra", g: "27AAHFS9902C1Z6", s: "Maharashtra (27)" }, { h: "Site", n: "Sai Residency, Plot 22", a: "Gangapur Rd, Nashik" }],
    meta: [["Work order", "WO/SSD/2026/14"], ["RA bill", "No. 3 · October 2026"], ["Measurement book", "MB-14, pages 22–31"], ["Place of supply", "Maharashtra (27)"], ["Reverse charge", "No"]],
    cols: [["desc", "Work item"], ["hsn", "SAC", 0, 1], ["qty", "Measure", "r"], ["rate", "Rate", "r"], ["amt", "Amount", "r"]],
    rows: [{ desc: "RCC slab work, 3rd floor", hsn: "995411", qty: 1200, unit: "sq ft", rate: 180, gst: 18 }, { desc: "Internal plastering", sub: "Floors 1 and 2", hsn: "995454", qty: 5200, unit: "sq ft", rate: 16, gst: 18 }, { desc: "Brickwork", hsn: "995454", qty: 42, unit: "cu m", rate: 3400, gst: 18 }],
    less: [{ label: "Less: retention 5%", pct: 5 }],
    notes: ["Works contract service; GST at 18% on the full value.", "Retention is released after the 12-month defect liability period."] },
  hotel: { doc: "Tax Invoice", ids: "FSSAI 11324001000123 · PAN AAJFK4411P", desig: "Front office", hsnSum: true,
    parties: [{ h: "Guest", n: "Anand and Meera Joshi", a: "Kothrud, Pune, Maharashtra" }],
    meta: [["Booking", "KH-2611"], ["Check-in", "01 Nov 2026, 2:00 pm"], ["Check-out", "04 Nov 2026, 11:00 am"], ["Room", "Lake View 3 · 2 guests"], ["Place of supply", "Kerala (32)"], ["Reverse charge", "No"]],
    cols: [["desc", "Description"], ["hsn", "SAC", 0, 1], ["qty", "Nights / qty", "r"], ["rate", "Rate", "r"], ["gst", "GST", "r"], ["amt", "Amount", "r"]],
    rows: [{ desc: "Deluxe lake-view room", sub: "₹4,500 per night", hsn: "996311", qty: 3, unit: "nights", rate: 4500, gst: 5 }, { desc: "Kerala breakfast", hsn: "996331", qty: 6, unit: "plates", rate: 350, gst: 5 }, { desc: "Backwater canoe tour", hsn: "998555", qty: 1, unit: "trip", rate: 2500, gst: 18 }],
    notes: ["Room tariff up to ₹7,500 per night is taxed at 5% without input tax credit.", "Check-out time is 11:00 am."] },
  coach: { doc: "Tax Invoice · Fee Receipt", ids: "PAN AAKFB7720E", desig: "Accounts office",
    parties: [{ h: "Student", n: "Aarav Mehta", a: "Roll no. JEE-26-1148 · Batch Alpha-2" }, { h: "Paid by", n: "Rakesh Mehta (parent)", a: "Talwandi, Kota, Rajasthan" }],
    meta: [["Course", "JEE Foundation 2026-27"], ["Instalment", "2 of 4"], ["Next due", "15 Jan 2027"], ["Reverse charge", "No"]],
    cols: [["desc", "Course / fee"], ["hsn", "SAC", 0, 1], ["qty", "Qty", "r"], ["rate", "Rate", "r"], ["amt", "Amount", "r"]],
    rows: [{ desc: "Tuition fee, term 2", hsn: "999293", qty: 1, unit: "term", rate: 45000, gst: 18 }, { desc: "Weekly test series", hsn: "999293", qty: 12, unit: "tests", rate: 500, gst: 18 }, { desc: "Doubt-clearing sessions", hsn: "999293", qty: 8, unit: "sessions", rate: 750, gst: 18 }],
    notes: ["Coaching services are taxed at 18%.", "Fees are refundable only as per the admission policy."] },
  pharma: { doc: "Tax Invoice", ids: "DL No. 20B/MP/IND/4411 · 21B/MP/IND/4412", desig: "Registered pharmacist · Reg. MP/22451", stampLbl: "PHARMACIST", hsnSum: true,
    parties: [{ h: "Patient", n: "Mr. R. Verma, 58 yrs", a: "Vijay Nagar, Indore" }, { h: "Prescribed by", n: "Dr. P. Jain, MD", a: "Reg. MPMC 12345 · Rx dated 04 Nov 2026"}],
    meta: [["Counter", "1"], ["Payment", "UPI"], ["Place of supply", "Madhya Pradesh (23)"], ["Reverse charge", "No"]],
    cols: [["desc", "Medicine"], ["batch", "Batch"], ["exp", "Exp."], ["hsn", "HSN", 0, 2], ["qty", "Qty", "r"], ["mrp", "MRP", "r"], ["rate", "Rate", "r", 1], ["amt", "Amount", "r"]],
    rows: [{ desc: "Paracetamol 650 mg", sub: "Strip of 15 · Mfr: Micro Labs", batch: "PC2291", exp: "08/27", hsn: "3004", qty: 4, unit: "strip", mrp: 33, rate: 30, gst: 5 }, { desc: "Vitamin D3 60K", sub: "Strip of 4 · Mfr: Mankind", batch: "VD118", exp: "03/28", hsn: "3004", qty: 2, unit: "strip", mrp: 135, rate: 120, gst: 5 }, { desc: "Digital BP monitor", sub: "Sr. BP8812 · 5-year warranty", batch: "—", exp: "—", hsn: "9018", qty: 1, unit: "pc", mrp: 2190, rate: 1850, gst: 5 }],
    notes: ["Schedule H and H1 drugs are sold only against a valid prescription.", "Please check the expiry date before use."] },
  jewel: { doc: "Tax Invoice", ids: "BIS licence HM/C-5160012345 · PAN AAPFS8812H", desig: "Proprietor", stampLbl: "HALLMARKED", hsnSum: true,
    parties: [{ h: "Customer", n: "Kavya Patel", a: "Adajan, Surat, Gujarat · PAN ABCPP1234K" }],
    meta: [["Order", "SJ-0921"], ["22K gold rate", "₹7,000 / g on 04 Nov 2026"], ["Hallmark centre", "Surat AHC-4411"], ["Place of supply", "Gujarat (24)"], ["Reverse charge", "No"]],
    cols: [["desc", "Ornament"], ["huid", "HUID"], ["purity", "Purity"], ["gw", "Gross wt", "r", 1], ["nw", "Net wt", "r"], ["gold", "Gold value", "r"], ["making", "Making", "r"], ["amt", "Amount", "r"]],
    rows: [{ desc: "Gold necklace", sub: "Temple design", hsn: "7113", huid: "7K2P9Q", purity: "22K · 916", gw: "19.10 g", nw: "18.40 g", gold: 128800, making: 9200, amt: 138000, gst: 3, qty: 1, unit: "pc" }, { desc: "Gold earrings, pair", hsn: "7113", huid: "3MX8L2", purity: "22K · 916", gw: "6.20 g", nw: "5.80 g", gold: 40600, making: 3600, amt: 44200, gst: 3, qty: 1, unit: "pair" }, { desc: "Hallmarking charges", hsn: "998346", huid: "—", purity: "—", gw: "—", nw: "—", gold: 0, making: 0, amt: 90, gst: 18, qty: 2, unit: "pcs" }],
    notes: ["Gold value = net weight × the 22K rate on the invoice date. HUID can be checked on the BIS CARE app.", "Making charges are part of the jewellery sale and taxed with it at 3%.", "PAN is required for purchases of ₹2 lakh or more."] },
  freight: { doc: "Tax Invoice · Freight Bill", ids: "Goods Transport Agency · PAN AAKFS6620L", desig: "Partner", rcm: true,
    parties: [{ h: "Consignor", n: "Ludhiana Forgings Ltd", a: "Focal Point, Ludhiana, Punjab", g: "03AAACL2244B1Z1", s: "Punjab (03)" }, { h: "Consignee · billed party", n: "Deccan Auto Parts Pvt Ltd", a: "Plant 2, MIDC Chakan, Pune", g: "27AAHCD4410K1Z9", s: "Maharashtra (27)" }],
    meta: [["Consignment note", "LR 4471 · 01 Nov 2026"], ["Route", "Ludhiana → Pune, 1,620 km"], ["Vehicle", "PB-10-HK-6612"], ["Weight / packages", "9 t · 36 crates"], ["E-way bill", "0310 7782 4419"], ["Reverse charge", "Yes"]],
    cols: [["desc", "Service"], ["hsn", "SAC", 0, 1], ["qty", "Qty", "r"], ["rate", "Rate", "r"], ["amt", "Amount", "r"]],
    rows: [{ desc: "Freight, full truck load", sub: "Ludhiana → Pune", hsn: "996511", qty: 1, unit: "trip", rate: 62000, gst: 5 }, { desc: "Loading and unloading", hsn: "996511", qty: 1, unit: "job", rate: 3500, gst: 5 }, { desc: "Detention", hsn: "996511", qty: 1, unit: "day", rate: 2500, gst: 5 }],
    notes: ["GST on GTA services is payable by the recipient under reverse charge at 5%. Forward-charge options: 5% without input tax credit, or 18% with it.", "Goods are carried at owner's risk. Claims within 7 days of delivery."] },
  mfg: { doc: "Tax Invoice", ids: "CIN U29304MH2011PTC223344 · PAN AAKCP1234Q · Udyam UDYAM-MH-26-0012345", desig: "Director", irn: true, hsnSum: true,
    parties: [{ h: "Bill to", n: "Sanand Motors India Pvt Ltd", a: "Plot 14, Sanand GIDC, Ahmedabad, Gujarat", g: "24AADCS5521M1Z3", s: "Gujarat (24)" }, { h: "Ship to", n: "Sanand Motors – Assembly Plant 2", a: "Survey 221, Khoraj, Sanand, Gujarat", g: "24AADCS5521M1Z3", s: "Gujarat (24)" }],
    meta: [["PO no. / date", "SM/PO/26/8812 · 20 Oct 2026"], ["E-way bill", "2712 4409 8831"], ["Transporter", "VRL Logistics"], ["Vehicle / LR", "MH-14-KQ-2231 · LR 88214"], ["Mode", "Road"], ["Place of supply", "Gujarat (24)"], ["Reverse charge", "No"]],
    cols: [["desc", "Description of goods"], ["hsn", "HSN"], ["qty", "Qty", "r"], ["rate", "Rate", "r"], ["gst", "GST", "r", 1], ["amt", "Taxable", "r"]],
    rows: [{ desc: "Brake caliper bracket", sub: "Part BC-2210 · Drawing rev C", hsn: "870830", qty: 1200, unit: "nos", rate: 185, gst: 18 }, { desc: "Steering knuckle, machined", sub: "Part SK-118", hsn: "870894", qty: 400, unit: "nos", rate: 640, gst: 18 }, { desc: "Rubber bush kit", sub: "Part RB-07", hsn: "401699", qty: 1500, unit: "nos", rate: 22, gst: 18 }, { desc: "Packing and forwarding", hsn: "870830", qty: 1, unit: "lot", rate: 6500, gst: 18 }],
    notes: ["Certified that the particulars given above are true and correct.", "E-invoice IRN generated on the IRP. HSN shown at 6 digits as turnover exceeds ₹5 crore.", "Interest at 18% p.a. on payments after 45 days."] }
};

export const EXTRA = {
  studio: { web: "sharmainteriors.in", social: "@sharmainteriors", refs: { title: "Finishes and design board", sw: [["Matte teal laminate", "#0E5E5A", "Merino 2214"], ["Natural oak veneer", "#C8A27A", "Greenply"], ["Brushed brass", "#B08D57", "Handles"]], tags: ["Quartz top", "Soft-close hinges"], thumbs: [["Kitchen render", "waves"], ["Elevation", "geo"], ["Living render", "blobs"]], link: "sharmainteriors.in/board/WO-2026-118" } },
  ledger: { web: "iyerassociates.in" },
  hazard: { social: "WhatsApp 98490 22110" },
  legal: { web: "mehtalegal.in" },
  festive: { web: "annapurnacaterers.in", social: "@annapurnajaipur", refs: { title: "Menu and decor references", sw: [["Marigold", "#F2A93B", "Florals"], ["Royal red", "#B3261E", "Drapes"], ["Ivory", "#F7EFE2", "Table linen"]], tags: ["Royal Rajasthani menu", "Live chaat"], thumbs: [["Stage decor", "mandala"], ["Buffet layout", "geo"], ["Menu card", "terrazzo"]], link: "annapurnacaterers.in/event/AG-18NOV" } },
  glow: { web: "glowskinstudio.in", social: "@glowskin.blr" },
  coral: { web: "frameandfield.in", social: "@frameandfield", refs: { title: "Gallery and album preview", sw: [["Warm film", "#E8A27A", "Edit preset"], ["Sunset coral", "#E8553E", "Album cover"], ["Sand", "#E9D8C4", "Album paper"]], tags: ["120 edits", "Lay-flat album"], thumbs: [["Beach set", "waves"], ["Fort set", "topo"], ["Album cover", "blobs"]], link: "frameandfield.in/g/FF-118" } },
  forest: { web: "bhoomiorganics.in", goods: true, ack: "Received the above goods in good condition." },
  tech: { web: "kodeleaf.com" },
  boutique: { web: "noorcouture.in", social: "@noorcouture", goods: true, refs: { title: "Design and fabric references", sw: [["Rani pink", "#C2185B", "Pantone 17-2034"], ["Antique gold", "#B08D57", "Zari work"], ["Ivory", "#F3EBDD", "Lining"]], tags: ["Raw silk", "Zardozi", "12-panel kalidar"], thumbs: [["Front sketch", "terrazzo"], ["Back sketch", "mandala"], ["Dupatta border", "geo"]], link: "noorcouture.in/look/NC-310" } },
  hindi: { goods: true, ack: "माल सही हालत में प्राप्त हुआ · Received the goods in good condition." },
  build: {},
  hotel: { web: "kayalhomestay.in", social: "@kayalhomestay" },
  coach: { web: "brightminds.edu.in" },
  pharma: { goods: true },
  jewel: { web: "sonijewellers.in", social: "@sonijewellers", goods: true, refs: { title: "Design references", sw: [["22K yellow gold", "#D4A537", "916"], ["Ruby", "#9B1B30", "Stones"], ["Polki", "#E8E0C9", "Uncut"]], tags: ["Temple design", "Antique finish"], thumbs: [["Necklace CAD", "mandala"], ["Earrings CAD", "blobs"], ["Packaging", "geo"]], link: "sonijewellers.in/design/SJ-0921" } },
  freight: { ack: "Received the consignment in good condition." },
  mfg: { web: "precisionauto.co.in", goods: true, ack: "Received the above goods in good condition." }
};
Object.entries(EXTRA).forEach(([k, v]) => FORMATS[k] && Object.assign(FORMATS[k], v));

export const COPY_G = ["Original for recipient", "Duplicate for transporter", "Triplicate for supplier"];
export const COPY_S = ["Original for recipient", "Duplicate for supplier"];

export const LAYOUTS = [
  ["band", "Band"], ["sidebar", "Sidebar"], ["classic", "Classic"],
  ["minimal", "Minimal"], ["hero", "Hero total"], ["split", "Split"],
  ["receipt", "Receipt"], ["editorial", "Editorial"], ["cards", "Cards"], ["frame", "Frame"]
];

export const ARTS = [
  ["none", "None"], ["waves", "Waves"], ["blobs", "Blobs"],
  ["geo", "Geometric"], ["mandala", "Rangoli"], ["terrazzo", "Terrazzo"], ["topo", "Contour"]
];

export const STATUSES = [
  ["draft", "Draft"], ["sent", "Sent"], ["part", "Part paid"],
  ["overdue", "Overdue"], ["paid", "Paid"]
];

export const OCCS = [
  ["none", "None"], ["diwali", "Diwali"], ["eid", "Eid"],
  ["christmas", "Christmas"], ["pongal", "Pongal"]
];

export const OUTS = [
  ["a4", "A4 PDF"], ["phone", "Phone page"], ["thermal", "Thermal 80mm"]
];

export const LVLS = [
  ["0", "Essential"], ["1", "Standard"], ["2", "Complete"]
];

export const SIZES = [
  ["0.92", "Small"], ["1", "Medium"], ["1.08", "Large"]
];

export const TABLES = [
  ["clean", "Clean"], ["zebra", "Zebra"], ["boxed", "Boxed"],
  ["none", "Borderless"], ["round", "Rounded rows"], ["cards", "Card rows"]
];

export const PAPERS = {
  white: ["White", "#FFFFFF"],
  cream: ["Cream", "#FBF6EC"],
  grey: ["Soft grey", "#F3F4F6"],
  kraft: ["Kraft", "#E8D6B6"],
  linen: ["Linen", "#FAF7F1"],
  handmade: ["Handmade", "#FBF8F0"],
  dotted: ["Dotted grid", "#FFFFFF"]
};

export const STAMPS = [
  ["off", "None"], ["#1E3A8A", "Blue ink"], ["#B91C1C", "Red ink"],
  ["#5B21B6", "Violet ink"], ["brand", "Brand colour"]
];

export const SIGS = [
  ["script", "Handwritten"], ["drawn", "Draw my own"], ["none", "None"]
];

export const QRS = [
  ["classic", "Classic"], ["brand", "Brand colour"], ["dots", "Dots + logo"]
];

export const MSGS = [
  ["none", "None"], ["thanks", "Thank-you"], ["review", "Google review"],
  ["social", "Social handles"], ["offer", "Next-order offer"]
];

export const PAL_FAM = {
  "Indian heritage": [["Saffron Indigo", "#E8731A", "#2B3A8C"], ["Banarasi", "#7A1630", "#D4A537"], ["Kasavu", "#C9A227", "#3B2F1E"], ["Jaipur Pink", "#D9537A", "#F2B5C4"], ["Madhubani", "#C8231F", "#F2C230"], ["Peacock", "#0F6E7A", "#3E9C5A"], ["Mehendi", "#5C6B1E", "#C68B3A"], ["Temple", "#8B2E16", "#E5B85C"]],
  "Earthy": [["Terracotta", "#B5532E", "#E8C39E"], ["Olive", "#5F6B3A", "#C9C29A"], ["Clay", "#9C5A3C", "#E3C1A6"], ["Sand", "#C2A26B", "#5A4632"], ["Moss", "#3F5B3A", "#A7BF8A"], ["Cocoa", "#5B3A29", "#C89F7A"], ["Slate", "#4A5563", "#A8B4C2"], ["Sage", "#7D9A84", "#E2E8DD"]],
  "Pastel": [["Peach", "#F4A58A", "#FFE1D3"], ["Mint", "#7CCBB0", "#DDF4EC"], ["Lavender", "#A992E2", "#EDE6FB"], ["Sky", "#7DB7F0", "#E1EFFC"], ["Butter", "#F2CF63", "#FFF5D1"], ["Blush", "#EBA3B8", "#FBE4EB"], ["Lilac", "#C39BD3", "#F3E8F8"], ["Aqua", "#6FD0D6", "#DDF6F7"]],
  "Luxury": [["Black Gold", "#141414", "#C9A54B"], ["Emerald Gold", "#0D4D3A", "#C9A54B"], ["Navy Gold", "#14213D", "#E0B04F"], ["Wine", "#5A1428", "#D8B26E"], ["Onyx Silver", "#1E1F24", "#B9BEC7"], ["Royal Purple", "#3D1A6B", "#D9B25F"], ["Pearl", "#3A3A3A", "#E9E1D3"], ["Champagne", "#7C6A4F", "#EADBC3"]],
  "Corporate": [["Trust Blue", "#1F5FBF", "#9CC3F5"], ["Steel", "#36495E", "#A9B7C6"], ["Teal Pro", "#0B6E6E", "#7FC8C3"], ["Indigo Pro", "#3B3FB6", "#AEB1F2"], ["Graphite", "#2F3238", "#9AA0A8"], ["Forest Pro", "#1F5E44", "#9FD2B5"], ["Maroon Pro", "#7A1F2B", "#E2A7AE"], ["Ocean", "#0E4C75", "#6CB6D9"]],
  "Bold": [["Electric", "#3A3FE0", "#00E0C0"], ["Hot Pink", "#E6197A", "#FFC1DC"], ["Lime", "#7AC70C", "#1E2A05"], ["Tangerine", "#FF6A13", "#FFD166"], ["Volt", "#C6F21A", "#1A1A1A"], ["Ultraviolet", "#6A1BFF", "#FF4FD8"], ["Cyber", "#00B3FF", "#FFE600"], ["Fire", "#E5261F", "#FFB020"]],
  "Seasonal": [["Diwali", "#B3261E", "#F2A93B"], ["Holi", "#E94BA0", "#30B6F2"], ["Eid", "#0F5E46", "#E8C76B"], ["Christmas", "#A11B1B", "#1F6B3A"], ["Monsoon", "#2F6F7A", "#9AD1D4"], ["Summer", "#FF8C42", "#FFD23F"], ["Winter", "#3D5A80", "#E0FBFC"], ["Spring", "#7FB069", "#F4D35E"]],
  "Monochrome": [["Charcoal", "#2D3136", "#9AA0A8"], ["Ink", "#111827", "#6B7280"], ["Mono Blue", "#1E3A8A", "#93C5FD"], ["Mono Green", "#14532D", "#86EFAC"], ["Mono Red", "#7F1D1D", "#FCA5A5"], ["Mono Violet", "#4C1D95", "#C4B5FD"], ["Mono Teal", "#134E4A", "#5EEAD4"], ["Mono Brown", "#78350F", "#FCD34D"]]
};

export const EXTRA_FONTS = [
  ["Fraunces", "Jost"], ["Syne", "Manrope"], ["Oswald", "Karla"], ["Playfair Display", "DM Sans"],
  ["Cormorant Garamond", "Jost"], ["Bricolage Grotesque", "Manrope"], ["Archivo", "IBM Plex Mono"],
  ["DM Serif Display", "Outfit"], ["Libre Baskerville", "Karla"], ["Outfit", "JetBrains Mono"],
  ["Instrument Serif", "Manrope"], ["Sora", "Sora"], ["Lexend", "Lexend"], ["Yeseva One", "Josefin Sans"],
  ["Abril Fatface", "Lora"], ["Marcellus", "Jost"], ["Josefin Sans", "Lora"], ["Lora", "Outfit"],
  ["Instrument Serif", "IBM Plex Mono"], ["Sora", "DM Sans"], ["Yeseva One", "Poppins"],
  ["Marcellus", "Karla"], ["Abril Fatface", "Barlow"], ["Lexend", "JetBrains Mono"]
];

export const FONTPAIRS = [
  ...STYLES.map(s => ({ fd: s.fd, fb: s.fb, fn: s.fn, fdi: s.fdi })),
  ...EXTRA_FONTS.map(([fd, fb]) => ({ fd, fb }))
];

export const SERIFS = [
  "Fraunces", "Libre Baskerville", "Cormorant Garamond", "Playfair Display", "DM Serif Display",
  "Instrument Serif", "Yeseva One", "Abril Fatface", "Marcellus", "Lora"
];

export const LANGS = [
  ["en", "English"], ["hi", "हिन्दी"], ["mr", "मराठी"], ["gu", "ગુજરાતી"],
  ["bn", "বাংলা"], ["ta", "தமிழ்"], ["te", "తెలుగు"], ["kn", "ಕನ್ನಡ"],
  ["ml", "മലയാളം"], ["pa", "ਪੰਜਾਬੀ"]
];

export const SCRIPTFONT = {
  hi: "Noto Sans Devanagari", mr: "Noto Sans Devanagari", gu: "Noto Sans Gujarati",
  bn: "Noto Sans Bengali", ta: "Noto Sans Tamil", te: "Noto Sans Telugu",
  kn: "Noto Sans Kannada", ml: "Noto Sans Malayalam", pa: "Noto Sans Gurmukhi"
};

export const EN = {
  inv: "Tax Invoice", bill: "Billed to", ship: "Ship to", due: "Amount due",
  item: "Item", qty: "Qty", rate: "Rate", disc: "Disc.", amt: "Amount",
  sub: "Subtotal", total: "Total", pay: "Pay by UPI · no fee", thanks: "Thank you for your business."
};

export const LOC = {
  hi: { inv: "कर बीजक", bill: "प्राप्तकर्ता", due: "देय राशि", item: "विवरण", qty: "मात्रा", rate: "दर", amt: "राशि", total: "कुल", thanks: "धन्यवाद! फिर पधारें।" },
  mr: { inv: "कर बीजक", bill: "प्राप्तकर्ता", due: "देय रक्कम", item: "तपशील", qty: "संख्या", rate: "दर", amt: "रक्कम", total: "एकूण", thanks: "धन्यवाद! पुन्हा भेट द्या." },
  gu: { inv: "ટેક્સ ઇન્વૉઇસ", bill: "બિલ મેળવનાર", due: "ચૂકવવાની રકમ", item: "વિગત", qty: "જથ્થો", rate: "દર", amt: "રકમ", total: "કુલ", thanks: "આભાર! ફરી પધારજો." },
  bn: { inv: "কর চালান", bill: "প্রাপক", due: "প্রদেয় অর্থ", item: "বিবরণ", qty: "পরিমাণ", rate: "দর", amt: "মূল্য", total: "মোট", thanks: "ধন্যবাদ! আবার আসবেন।" },
  ta: { inv: "வரி விலைப்பட்டியல்", bill: "பெறுநர்", due: "செலுத்த வேண்டிய தொகை", item: "விவரம்", qty: "அளவு", rate: "விலை", amt: "தொகை", total: "மொத்தம்", thanks: "நன்றி! மீண்டும் வருக." },
  te: { inv: "పన్ను ఇన్వాయిస్", bill: "స్వీకర్త", due: "చెల్లించవలసిన మొత్తం", item: "వివరాలు", qty: "పరిమాణం", rate: "ధర", amt: "విలువ", total: "మొత్తం", thanks: "ధన్యవాదాలు! మళ్ళీ రండి." },
  kn: { inv: "ತೆರಿಗೆ ಸರಕುಪಟ್ಟಿ", bill: "ಸ್ವೀಕರಿಸುವವರು", due: "ಪಾವತಿಸಬೇಕಾದ ಮೊತ್ತ", item: "ವಿವರ", qty: "ಪ್ರಮಾಣ", rate: "ದರ", amt: "ಮೊತ್ತ", total: "ಒಟ್ಟು", thanks: "ಧನ್ಯವಾದಗಳು! ಮತ್ತೆ ಬನ್ನಿ." },
  ml: { inv: "നികുതി ഇൻവോയ്സ്", bill: "സ്വീകർത്താവ്", due: "അടയ്ക്കേണ്ട തുക", item: "വിവരണം", qty: "അളവ്", rate: "നിരക്ക്", amt: "തുക", total: "ആകെ", thanks: "നന്ദി! വീണ്ടും വരിക." },
  pa: { inv: "ਟੈਕਸ ਇਨਵੌਇਸ", bill: "ਪ੍ਰਾਪਤਕਰਤਾ", due: "ਬਕਾਇਆ ਰਕਮ", item: "ਵੇਰਵਾ", qty: "ਮਾਤਰਾ", rate: "ਦਰ", amt: "ਰਕਮ", total: "ਕੁੱਲ", thanks: "ਧੰਨਵਾਦ! ਫਿਰ ਆਉਣਾ।" }
};

export const BLOCKS = {
  parties: ["Parties & amount", 1],
  details: ["Invoice details", 0],
  items: ["Items", 1],
  summary: ["Totals & QR", 1],
  hsn: ["HSN / tax summary", 0],
  refs: ["Design references", 0],
  terms: ["Bank & declarations", 0],
  signature: ["Signature & stamp", 1],
  message: ["Footer message", 0]
};

/* Math & Color Helpers */
export const fmt = n => "₹" + Math.round(n).toLocaleString("en-IN");
export const fmt2 = n => (n < 0 ? "−" : "") + "₹" + Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function words(num) {
  const a = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const two = n => n < 20 ? a[n] : b[Math.floor(n / 10)] + (n % 10 ? "-" + a[n % 10] : "");
  const three = n => { const h = Math.floor(n / 100), r = n % 100; return (h ? a[h] + " hundred" + (r ? " " : "") : "") + (r ? two(r) : ""); };
  let n = Math.round(num); if (!n) return "Rupees zero only"; const out = [];
  const cr = Math.floor(n / 1e7); n %= 1e7; const lk = Math.floor(n / 1e5); n %= 1e5; const th = Math.floor(n / 1000); n %= 1000;
  if (cr) out.push(three(cr) + " crore"); if (lk) out.push(two(lk) + " lakh"); if (th) out.push(two(th) + " thousand"); if (n) out.push(three(n));
  return "Rupees " + out.join(" ") + " only";
}

export const h2r = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
export const r2h = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
export const mix = (a, b, t) => { const x = h2r(a), y = h2r(b); return r2h(x.map((v, i) => v + (y[i] - v) * t)); };

export function lum(hex) {
  const c = h2r(hex).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
  return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
}

export const onColor = hex => lum(hex) > .36 ? "#14161C" : "#FFFFFF";

export function r2hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return [h, s, l];
}

export function hsl2h(h, s, l) {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return r2h([f(0) * 255, f(8) * 255, f(4) * 255]);
}

export const palFrom = (acc, acc2) => ({ acc, acc2, soft: mix(acc, "#FFFFFF", .9), ink: mix(acc, "#0D0F14", .84) });

export function seed(s) {
  let h = 2166136261;
  for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
}

let uid = 0;

/* QR Code SVG Generator */
export function qr(id, o = {}) {
  const dark = o.dark || "#14161C", style = o.style || "classic", r = seed(id), N = 25;
  let d = "", dots = "";
  const finder = (x, y) => (x < 7 && y < 7) || (x > N - 8 && y < 7) || (x < 7 && y > N - 8);
  const center = (x, y) => style === "dots" && x >= 9 && x <= 15 && y >= 9 && y <= 15;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (finder(x, y) || center(x, y)) continue;
      if (r() > .52) {
        if (style === "dots") dots += `<circle cx="${x + .5}" cy="${y + .5}" r=".44"/>`;
        else d += `M${x} ${y}h1v1h-1z`;
      }
    }
  }
  const sq = (x, y) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
  const rf = (x, y) => `<rect x="${x + .5}" y="${y + .5}" width="6" height="6" rx="1.8" fill="none" stroke="${dark}" stroke-width="1"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx=".9"/>`;
  let s = `<svg viewBox="-1 -1 27 27" role="img" aria-label="Sample UPI QR code"><rect x="-1" y="-1" width="27" height="27" rx="${style === "dots" ? 3 : 0}" fill="#fff"/>`;
  if (style === "dots") {
    s += `<g fill="${dark}">${dots}${rf(0, 0)}${rf(N - 7, 0)}${rf(0, N - 7)}</g>`;
    s += `<rect x="9.3" y="9.3" width="6.4" height="6.4" rx="1.6" fill="#fff" stroke="${dark}" stroke-width=".4"/>`;
    s += o.logoImg ? `<image href="${o.logoImg}" x="9.8" y="9.8" width="5.4" height="5.4" preserveAspectRatio="xMidYMid meet"/>` : `<text x="12.5" y="13.6" text-anchor="middle" font-size="3" font-weight="800" font-family="Archivo,sans-serif" fill="${dark}">${o.logoTxt || ""}</text>`;
  } else {
    s += `<path fill="${dark}" fill-rule="evenodd" d="${d}${sq(0, 0)}${sq(N - 7, 0)}${sq(0, N - 7)}"/>`;
  }
  return s + "</svg>";
}

/* Generative Brand Art Generator */
export function art(kind, sd, c1, c2) {
  if (!kind || kind === "none") return "";
  const r = seed(sd), W = 400, H = 200, lite = onColor(c1) === "#FFFFFF" ? "#FFFFFF" : "#000000", P = v => v.toFixed(1);
  let s = `<svg class="art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="${W}" height="${H}" fill="${c1}"/>`;
  if (kind === "waves") {
    for (let i = 0; i < 6; i++) {
      const y = H * (.2 + i * .14), amp = 8 + r() * 22, ph = r() * 6, fr = 60 + r() * 80;
      let d = `M0 ${P(y)}`;
      for (let x = 0; x <= W; x += 16) d += ` L${x} ${P(y + Math.sin(x / fr + ph) * amp)}`;
      d += ` L${W} ${H} L0 ${H}Z`;
      s += `<path d="${d}" fill="${i % 2 ? c2 : lite}" opacity="${(.1 + i * .05).toFixed(2)}"/>`;
    }
  }
  if (kind === "blobs") {
    for (let i = 0; i < 8; i++) s += `<circle cx="${P(r() * W)}" cy="${P(r() * H)}" r="${P(20 + r() * 80)}" fill="${i % 2 ? c2 : lite}" opacity="${(.12 + r() * .25).toFixed(2)}"/>`;
  }
  if (kind === "geo") {
    const g = 40;
    for (let y = 0; y < H; y += g) {
      for (let x = 0; x < W; x += g) {
        const t = r(), c = r() > .5 ? c2 : lite, o = (.1 + r() * .35).toFixed(2);
        if (t < .3) s += `<path d="M${x} ${y}h${g}L${x} ${y + g}Z" fill="${c}" opacity="${o}"/>`;
        else if (t < .55) s += `<path d="M${x} ${y + g}A${g} ${g} 0 0 1 ${x + g} ${y}V${y + g}Z" fill="${c}" opacity="${o}"/>`;
        else if (t < .7) s += `<circle cx="${x + g / 2}" cy="${y + g / 2}" r="${g / 4}" fill="${c}" opacity="${o}"/>`;
      }
    }
  }
  if (kind === "mandala") {
    const cx = W * (.62 + r() * .3), cy = H * (.35 + r() * .3);
    for (let k = 4; k >= 1; k--) {
      const n = 6 + k * 4, rad = k * 34, rot = r() * 30;
      for (let i = 0; i < n; i++) {
        const a = i * 360 / n + rot;
        s += `<ellipse cx="${P(cx)}" cy="${P(cy - rad)}" rx="${P(6 + k * 2)}" ry="${P(14 + k * 4)}" transform="rotate(${P(a)} ${P(cx)} ${P(cy)})" fill="${k % 2 ? c2 : lite}" opacity="${(.14 + k * .05).toFixed(2)}"/>`;
      }
    }
    s += `<circle cx="${P(cx)}" cy="${P(cy)}" r="16" fill="${c2}" opacity=".55"/>`;
    for (let i = 0; i < 40; i++) s += `<circle cx="${P(r() * W)}" cy="${P(r() * H)}" r="${P(1 + r() * 2.5)}" fill="${lite}" opacity=".35"/>`;
  }
  if (kind === "terrazzo") {
    for (let i = 0; i < 70; i++) {
      const x = r() * W, y = r() * H, z = 4 + r() * 14, c = r() > .5 ? c2 : lite, o = (.2 + r() * .4).toFixed(2);
      s += r() > .5 ? `<path d="M${P(x)} ${P(y)}l${P(z)} ${P(z * .3)}l${P(-z * .4)} ${P(z)}Z" fill="${c}" opacity="${o}"/>` : `<ellipse cx="${P(x)}" cy="${P(y)}" rx="${P(z * .6)}" ry="${P(z * .35)}" transform="rotate(${P(r() * 180)} ${P(x)} ${P(y)})" fill="${c}" opacity="${o}"/>`;
    }
  }
  if (kind === "topo") {
    const cx = W * (.3 + r() * .5), cy = H * (.3 + r() * .4), p0 = r() * 6, p1 = r() * 6;
    for (let k = 1; k <= 12; k++) {
      let d = "";
      for (let a = 0; a <= 360; a += 10) {
        const t = a * Math.PI / 180, rr = k * 17 * (1 + .18 * Math.sin(3 * t + p0) + .1 * Math.sin(5 * t + p1));
        d += (a ? "L" : "M") + P(cx + Math.cos(t) * rr * 1.6) + " " + P(cy + Math.sin(t) * rr);
      }
      s += `<path d="${d}Z" fill="none" stroke="${k % 3 ? lite : c2}" stroke-width="1.4" opacity="${k % 3 ? .25 : .6}"/>`;
    }
  }
  return s + "</svg>";
}

/* Company Stamp SVG Generator */
export function stampSvg(t, color, lbl) {
  lbl = lbl || "AUTHORISED";
  const id = "sp" + (uid++), txt = (" " + t.biz + " ✦ " + (t.city ? t.city.split(",")[0] : "INDIA") + " ✦").toUpperCase();
  return `<svg class="stmp" viewBox="0 0 120 120" role="img" aria-label="Company stamp"><defs><path id="${id}" d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0"/></defs><g fill="${color}" stroke="${color}"><circle cx="60" cy="60" r="56" fill="none" stroke-width="3.2"/><circle cx="60" cy="60" r="31" fill="none" stroke-width="1.4"/><text font-family="Archivo,sans-serif" font-size="10" font-weight="700" stroke="none" letter-spacing="1"><textPath href="#${id}" textLength="266" lengthAdjust="spacingAndGlyphs">${txt}</textPath></text><text x="60" y="58" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="800" font-size="15" stroke="none">${t.logo || "IN"}</text><text x="60" y="73" text-anchor="middle" font-family="Archivo,sans-serif" font-size="${lbl.length > 11 ? 5.2 : 6.6}" font-weight="700" stroke="none" letter-spacing=".5">${lbl}</text></g></svg>`;
}

export const OCCDEF = {
  diwali: { bg: "#3B1200", fg: "#FFD58A", greet: "Shubh Deepavali", m: `<svg viewBox="0 0 30 24"><path d="M15 2c3 4 4 7 0 10-4-3-3-6 0-10z" fill="#FFB300"/><path d="M3 14h24c-1 6-6 8-12 8S4 20 3 14z" fill="#E8590C"/></svg>` },
  eid: { bg: "#0F3D2E", fg: "#F4E3B2", greet: "Eid Mubarak", m: `<svg viewBox="0 0 30 24"><path d="M17 3a9 9 0 1 0 6 15 7.5 7.5 0 1 1-6-15z" fill="#F4E3B2"/><path d="M24 6l1 2.4 2.5.2-1.9 1.6.6 2.5-2.2-1.4-2.2 1.4.6-2.5-1.9-1.6 2.5-.2z" fill="#F4E3B2"/></svg>` },
  christmas: { bg: "#7A1010", fg: "#FFFFFF", greet: "Merry Christmas", m: `<svg viewBox="0 0 30 24"><path d="M15 2l9 14H6z" fill="#2E8B57"/><path d="M15 7l7 11H8z" fill="#3FA46A"/><rect x="13" y="18" width="4" height="4" fill="#8B5A2B"/><circle cx="15" cy="2.5" r="2" fill="#FFD54F"/></svg>` },
  pongal: { bg: "#FFF1C9", fg: "#7A3E00", greet: "Happy Pongal", m: `<svg viewBox="0 0 30 24"><circle cx="15" cy="12" r="5" fill="#F59E0B"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<rect x="14" y="1" width="2" height="4" fill="#F59E0B" transform="rotate(${a} 15 12)"/>`).join("")}</svg>` }
};

export function festBar(occ, t) {
  if (!occ || occ === "none") return "";
  const o = OCCDEF[occ];
  if (!o) return "";
  const m = o.m;
  return `<div class="fest" style="--fbg:${o.bg};--ffg:${o.fg}">${m}${m}<span>${o.greet} from ${t.biz}</span>${m}${m}</div>`;
}

export function msgDefault(type, t) {
  const h = "@" + (t.upi ? t.upi.split("@")[0] : "invoxa");
  return {
    thanks: `Thank you for choosing ${t.biz}. It was a pleasure working with you.`,
    review: "Loved our work? Scan to rate us on Google ★★★★★",
    social: `Follow us on Instagram ${h} · WhatsApp +91 90000 00000`,
    offer: "10% off your next order. Valid till 31 Dec 2026.",
    none: ""
  }[type] || "";
}

export const phoneOf = t => {
  const s = String(Math.floor(seed(t.id + "ph")() * 1e8)).padStart(8, "0");
  return "+91 98" + s.slice(0, 3) + " " + s.slice(3);
};

/* Calculation engine */
const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);

export function fmtOf(t) {
  const baseF = (t && t.id && FORMATS[t.id]) ? FORMATS[t.id] : {};

  // Build rows dynamically from t.items if provided so edits in Fill Details reflect live
  let rows = [];
  const isCustomBiz = t.isCustomInvoice || (t.biz && t.biz !== "Iyer & Associates" && t.biz !== "Sharma Interiors");
  if (t && t.items && t.items.length > 0) {
    rows = t.items.map((i, idx) => ({
      desc: i[0] || i.description || i.name || "Item",
      sub: i.sub || (isCustomBiz ? "" : (baseF.rows && baseF.rows[idx] && (baseF.rows[idx].desc === (i[0] || i.description) || !i.description) ? baseF.rows[idx].sub : (baseF.rows && baseF.rows[idx]?.sub))),
      hsn: i[1] || i.hsnSac || i.hsn || "998314",
      qty: parseFloat(i[2] || i.quantity || i.qty || 1),
      rate: parseFloat(i[3] || i.rate || 0),
      unit: i[4] || i.unit || "nos",
      gst: parseFloat(i[5] !== undefined ? i[5] : (t.gst || 18)),
      disc: parseFloat(t.disc || 0)
    }));
  } else if (baseF.rows) {
    rows = baseF.rows;
  }

  // Update customer / party details dynamically from t.client so customer edits reflect live
  let parties = baseF.parties ? baseF.parties.map((p, idx) => {
    if (idx === 0) {
      return {
        ...p,
        n: t.client || p.n || "Customer",
        a: t.ccity || p.a || "",
        g: t.cg !== undefined ? t.cg : (p.g || "")
      };
    }
    return p;
  }) : [{ h: "Billed to", n: t.client || "Customer", a: t.ccity || "", g: t.cg || "" }];

  if (parties.length === 0 && t.client) {
    parties = [{ h: "Billed to", n: t.client, a: t.ccity || "", g: t.cg || "" }];
  }

  const docTitle = t.docType
    ? (['quote', 'quotation'].includes(t.docType) ? 'Quotation' : t.docType === 'estimate' ? 'Estimate' : 'Tax Invoice')
    : (baseF.doc || "Tax Invoice");

  const defaultMeta = [
    ["Invoice No", t.invoiceNumber || "INV-001"],
    ["Invoice Date", t.invoiceDate || "18 Nov 2026"],
    ["Due Date", t.dueDate || "03 Dec 2026"],
    ["Place of supply", t.pos || "Maharashtra (27)"],
    ["Reverse charge", "No"]
  ];

  const meta = isCustomBiz
    ? defaultMeta
    : (baseF.meta || defaultMeta).map(m => {
        if (m[0] === "Place of supply" && t.pos) return [m[0], t.pos];
        if (m[0] === "Work order" && t.po) return [m[0], t.po];
        return m;
      });

  // Strip CA/template-specific metadata for custom businesses
  const customClean = isCustomBiz ? {
    ids: t.ids || (t.pan ? 'PAN ' + t.pan : ''),
    desig: 'Authorised Signatory',
    stampLbl: undefined,
    social: undefined,
    web: undefined,
    refs: undefined
  } : {};

  return {
    ...baseF,
    ...customClean,
    doc: isCustomBiz
      ? (['quote', 'quotation'].includes(t.docType) ? 'Quotation' : t.docType === 'estimate' ? 'Estimate' : 'Tax Invoice')
      : docTitle,
    parties,
    meta,
    cols: baseF.cols || [["desc", "Item"], ["hsn", "HSN/SAC", 0, 1], ["qty", "Qty", "r"], ["rate", "Rate", "r"], ["amt", "Amount", "r"]],
    rows,
    adv: t.adv !== undefined ? parseFloat(t.adv) : baseF.adv,
    notes: (t.notes && t.notes.length) ? (Array.isArray(t.notes) ? t.notes : t.notes.split('\n')) : (isCustomBiz ? [] : (baseF.notes || []))
  };
}

export function calc(t, status) {
  const F = fmtOf(t);
  const lines = F.rows.map(r => {
    const gross = r.amt != null ? r.amt : (r.qty || 1) * r.rate;
    const d = r.disc ? gross * r.disc / 100 : 0;
    const net = gross - d;
    return { ...r, qty: r.qty || 1, unit: r.unit || "", gst: r.gst || 0, gross, dsc: d, net, tax: net * (r.gst || 0) / 100 };
  });
  const gross = sum(lines, l => l.gross), disc = sum(lines, l => l.dsc), taxable = sum(lines, l => l.net), tax = sum(lines, l => l.tax);
  const rates = [...new Set(lines.map(l => l.gst))].sort((a, b) => a - b);
  const byRate = rates.map(r => { const ls = lines.filter(l => l.gst === r); return { r, taxable: sum(ls, l => l.net), tax: sum(ls, l => l.tax) }; });
  const hm = {};
  lines.forEach(l => { const k = l.hsn + "|" + l.gst; hm[k] = hm[k] || { hsn: l.hsn, gst: l.gst, taxable: 0, tax: 0 }; hm[k].taxable += l.net; hm[k].tax += l.tax; });
  const rcm = !!F.rcm, inv = rcm ? taxable : taxable + tax, total = Math.round(inv), ro = total - inv;
  const less = (F.less || []).map(x => ({ label: x.label, amt: x.pct ? Math.round(taxable * x.pct / 100) : x.amt }));
  const adv = F.adv != null ? F.adv : (t.adv || 0), bal = total - sum(less, x => x.amt) - adv;
  const paidPart = status === "part" ? Math.round(bal * .53 / 100) * 100 : 0;
  return { F, lines, gross, disc, taxable, tax, rates, byRate, hsn: Object.values(hm), rcm, total, ro, less, adv, advLbl: F.advLbl || "Advance received", bal, paidPart, due: status === "paid" ? 0 : bal - paidPart };
}

const MONEYK = ["rate", "mrp", "gold", "making"];
export function cell(k, l, lvl) {
  if (k === "desc") return `${l.desc}${lvl && l.sub ? `<small>${l.sub}</small>` : ""}`;
  if (k === "qty") return `${l.qty.toLocaleString("en-IN")}${lvl && l.unit ? " " + l.unit : ""}`;
  if (k === "amt") return fmt(l.net);
  if (k === "disc") return l.disc ? l.disc + "%" : "—";
  if (k === "gst") return l.gst + "%";
  if (MONEYK.includes(k)) return l[k] ? fmt(l[k]) : "—";
  return l[k] ?? "—";
}

export function resolve(t, o = {}) {
  const pal = o.pal ? { ...o.pal } : { acc: t.acc || "#0E5E5A", acc2: t.acc2 || "#3FA79B", soft: t.soft || "#E6F2F0", ink: t.ink || "#13211F" };
  const paperKey = o.paper || "white", paper = o.paperColor || (PAPERS[paperKey] ? PAPERS[paperKey][1] : "#FFFFFF");
  const fp = o.fp != null && o.fp !== "" ? FONTPAIRS[+o.fp] : { fd: t.fd || "Manrope", fb: t.fb || "IBM Plex Sans", fn: t.fn, fdi: t.fdi };
  const lang = o.lang || t.lang || "en", sf = SCRIPTFONT[lang] ? `,"${SCRIPTFONT[lang]}"` : "";
  const fd = `"${fp.fd}"${sf}` + (SERIFS.includes(fp.fd) ? ",Georgia,serif" : ",system-ui,sans-serif");
  const fb = `"${fp.fb}"${sf},system-ui,sans-serif`, fn = `"${fp.fn || fp.fb}"${sf},system-ui,sans-serif`;
  const L = k => { const loc = LOC[lang] && LOC[lang][k]; if (!loc) return EN[k]; return ["inv", "bill", "due", "total"].includes(k) ? `${loc} · ${EN[k]}` : loc; };
  const cols = o.cols || {};
  const C = k => cols[k] || (LOC[lang] && LOC[lang][k]) || EN[k];
  const vars = `--iink:${pal.ink};--ipaper:${paper};--acc:${pal.acc};--acc2:${pal.acc2};--soft:${pal.soft};--onacc:${onColor(pal.acc)};--line:${pal.ink}1A;--line2:${pal.ink}40;--fd:${fd};--fb:${fb};--fn:${fn};--pattern:linear-gradient(135deg,${pal.acc},${pal.acc2});`;
  return { pal, paperKey, fp, lang, L, C, vars };
}

/* A4 Page Renderer */
export function renderA4(t, o = {}) {
  const R = resolve(t, o), { L, pal } = R, lvl = +(o.lvl ?? 1), st = o.status || "sent", c = calc(t, st), F = c.F;
  const no = t.invoiceNumber || ("INV/26-27/" + String(100 + (t.id ? t.id.length * 17 : 34) + (o.l ? o.l.length * 7 : 28)).padStart(4, "0"));
  const artK = o.art ?? t.art, A = art(artK, (t.id || "inv") + (o.l || "band") + (o.v || 0), pal.acc, pal.acc2);
  const fz = [2.3, 2.0, 1.82][lvl] * (+o.size || 1);
  const lgInner = o.logoImg ? `<img src="${o.logoImg}" alt="">` : (t.logo || (t.biz ? t.biz.slice(0, 2).toUpperCase() : "IN"));
  const isCustomBiz = t.isCustomInvoice || (t.biz && t.biz !== "Iyer & Associates" && t.biz !== "Sharma Interiors");
  const W = isCustomBiz ? "" : (F.web || "");
  const contact = [t.phone || (isCustomBiz ? "" : phoneOf(t)), t.email || (W ? "accounts@" + W : ""), W].filter(Boolean).join(" · ");
  const customIds = t.ids || (t.pan ? "PAN " + t.pan : (isCustomBiz ? "" : F.ids));
  const head = `<div class="hd"><div class="lg${o.logoImg ? " img" : ""}">${lgInner}</div><div><div class="nm"${R.fp.fdi ? ' style="font-style:italic"' : ""}>${t.biz}</div><div class="sm">${t.city || ""}${lvl ? "<br>GSTIN " + (t.gstin || "N/A") : ""}${lvl && customIds ? "<br>" + customIds : ""}${lvl && contact ? "<br>" + contact : ""}</div></div></div>`;
  const docL = F.doc || "Tax Invoice";
  const copyLbl = F.goods ? COPY_S[0] : COPY_G[0];
  const title = `<div class="tt"><div class="lb">${st === "draft" ? "Draft · " : ""}${docL}</div>${lvl ? `<div class="copy">${copyLbl}</div>` : ""}<div class="no">${no}</div><div class="sm">${t.invoiceDate || "04 Nov 2026"} · Due ${t.dueDate || "19 Nov 2026"}</div>${lvl === 2 && F.irn ? `<div class="irn">IRN 7c1e…a94f · Ack 1126 2700 4471</div>` : ""}</div>`;
  const ps = lvl ? F.parties : F.parties.slice(0, 1);
  const party = (p, i) => `<div class="bt"><div class="lb">${i === 0 && R.lang !== "en" && LOC[R.lang] ? L("bill") : p.h}</div><b>${p.n}</b><div class="sm">${p.a || ""}${p.g ? "<br>GSTIN " + p.g : ""}${lvl === 2 && p.s ? "<br>State: " + p.s : ""}</div></div>`;
  const partiesFrom = k => ps.slice(k).map((p, i) => party(p, i + k)).join("");
  const due = `<div class="du"><div class="lb">${st === "paid" ? "Paid in full" : L("due")}</div><div class="big">${fmt(st === "paid" ? c.total : c.due)}</div><div class="sm">${st === "paid" ? "16 Nov 2026 · UPI" : st === "overdue" ? "was due 23 Oct · 12 days late" : "by " + (t.dueDate || "19 Nov 2026")}</div></div>`;
  const userC = o.cols || {}, MAPK = { desc: "item", qty: "qty", rate: "rate", amt: "amt" }, hasDisc = c.lines.some(l => l.disc);
  const cols = F.cols.filter(cd => (cd[3] || 0) <= lvl && !(cd[0] === "disc" && !hasDisc));
  const hdr = cd => { const m = MAPK[cd[0]]; return (m && userC[m]) || (m && LOC[R.lang] && LOC[R.lang][m]) || cd[1]; };
  const items = `<table class="tb-${o.tb || "clean"}"><thead><tr>${cols.map(cd => `<th${cd[2] ? ' class="r"' : ""}>${hdr(cd)}</th>`).join("")}</tr></thead><tbody>${c.lines.map(l => `<tr>${cols.map(cd => `<td${cd[2] ? ' class="r num"' : ""}>${cell(cd[0], l, lvl)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const rc = c.rcm ? " (RCM)" : "";
  const taxRows = c.byRate.filter(b => b.r > 0).map(b => t.intra !== false ? `<div><span>CGST ${b.r / 2}%${rc}</span><span class="num">${fmt2(b.tax / 2)}</span></div><div><span>SGST ${b.r / 2}%${rc}</span><span class="num">${fmt2(b.tax / 2)}</span></div>` : `<div><span>IGST ${b.r}%${rc}</span><span class="num">${fmt2(b.tax)}</span></div>`).join("");
  const totals = `<div class="tot">${c.disc ? `<div><span>${EN.sub}</span><span class="num">${fmt2(c.gross)}</span></div><div><span>Less discount</span><span class="num">${fmt2(-c.disc)}</span></div>` : ""}<div><span>Taxable value</span><span class="num">${fmt2(c.taxable)}</span></div>${taxRows}${c.rcm ? `<div class="rcm">GST of ${fmt2(c.tax)} is payable by the recipient under reverse charge</div>` : ""}${lvl && Math.abs(c.ro) >= .005 ? `<div><span>Round off</span><span class="num">${fmt2(c.ro)}</span></div>` : ""}<div class="gt"><span>${c.rcm ? "Invoice value" : L("total")}</span><span class="num">${fmt(c.total)}</span></div>${c.less.map(x => `<div><span>${x.label}</span><span class="num">${fmt2(-x.amt)}</span></div>`).join("")}${c.adv ? `<div><span>${c.advLbl}</span><span class="num">${fmt2(-c.adv)}</span></div>` : ""}${c.paidPart ? `<div><span>Paid on 10 Nov</span><span class="num">${fmt2(-c.paidPart)}</span></div>` : ""}${(c.adv || c.paidPart || c.less.length || st === "paid") ? `<div class="bal"><span>Balance due</span><span class="num">${fmt(c.due)}</span></div>` : ""}<div class="wd">${words(c.total)}</div></div>`;
  const qd = o.qr === "brand" || o.qr === "dots" ? (lum(pal.acc) < .3 ? pal.acc : pal.ink) : "#14161C";
  const qrCustom = o.qrImg || t.qrImg || t.upiQrUrl;
  const reviewQrCustom = o.reviewQrImg || t.reviewQrImg || t.reviewQrUrl;
  const pay = t.showUpiDetails === false ? "" : `<div class="py">${qrCustom ? `<div style="width:48px;height:48px;min-width:48px;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:6px;border:1px solid #cbd5e1;overflow:hidden;padding:2px;box-sizing:border-box;"><img src="${qrCustom}" alt="UPI QR" style="width:100%;height:100%;object-fit:contain;display:block;" /></div>` : qr((t.id || "inv") + (o.l || "band"), { dark: qd, style: o.qr === "dots" ? "dots" : "classic", logoTxt: t.logo || "IN", logoImg: o.logoImg })}<div><b>${EN.pay}</b>${t.upi ? `<div class="sm">${t.upi}</div>` : ""}</div></div>`;
  const details = `<div class="dt">${F.meta.map(m => `<div><span>${m[0]}</span>${m[1]}</div>`).join("")}<div><span>Due date</span>${t.dueDate || "19 Nov 2026"}</div>${lvl === 2 ? `<div><span>Supply type</span>${t.intra !== false ? "Intra-state" : "Inter-state"}</div>` : ""}</div>`;
  const hsnT = (lvl && F.hsnSum) || lvl === 2 ? `<div class="hsnw"><div class="lb">HSN / SAC summary</div><table class="hsnt"><thead><tr><th>HSN/SAC</th><th class="r">Taxable</th><th class="r">Rate</th>${t.intra !== false ? '<th class="r">CGST</th><th class="r">SGST</th>' : '<th class="r">IGST</th>'}<th class="r">Total tax</th></tr></thead><tbody>${c.hsn.map(h => `<tr><td>${h.hsn}</td><td class="r num">${fmt2(h.taxable)}</td><td class="r num">${h.gst}%</td>${t.intra !== false ? `<td class="r num">${fmt2(h.tax / 2)}</td><td class="r num">${fmt2(h.tax / 2)}</td>` : `<td class="r num">${fmt2(h.tax)}</td>`}<td class="r num">${fmt2(h.tax)}</td></tr>`).join("")}</tbody></table></div>` : "";
  const notes = (F.notes && F.notes.length ? F.notes : ["Payment due within 15 days. Interest at 18% p.a. on late payment."]).map(n => `<li>${n}</li>`).join("");
  const bankBlock = t.showBankDetails === false ? "" : `<div><b>Bank details</b>${t.bank ? t.bank[0] : "HDFC Bank"} · A/c ${t.bank ? t.bank[1] : "50200012345678"}<br>IFSC ${t.bank ? t.bank[2] : "HDFC0001234"}${t.bank?.[3] ? `<br>Branch ${t.bank[3]}` : ""}</div>`;
  const terms = `<div class="ft">${bankBlock}<div><b>Declarations</b><ul class="nl">${notes}<li>Subject to ${(t.city ? t.city.split(",")[0] : "Jurisdiction")} jurisdiction. E.&amp;O.E.</li></ul></div></div>`;
  const sigKind = o.sig || "script";
  const sigEl = sigKind === "none" ? "" : sigKind === "drawn" && o.sigImg ? `<img class="sigimg" src="${o.sigImg}" alt="Signature">` : `<div class="sig">${t.sign || "Authorised Signatory"}</div>`;
  const stampColor = !o.stamp || o.stamp === "off" ? null : o.stamp === "brand" ? (lum(pal.acc) < .4 ? pal.acc : pal.ink) : o.stamp;
  const ack = lvl && F.ack ? `<div class="ack"><div>${F.ack}</div><div class="ln2"></div><div class="sm">Receiver's name, signature and date</div></div>` : "<span></span>";
  const signature = `<div class="sgrow">${ack}<div class="signbox">${stampColor ? stampSvg(t, stampColor, F.stampLbl) : ""}<div class="sg"><div class="sm">For ${t.biz}</div>${sigEl}<div class="sm">${sigKind !== "none" ? (t.sign || "") + " · " : ""}${F.desig || "Authorised signatory"}</div></div></div></div>`;
  const refsHtml = lvl && F.refs ? `<div class="refs"><div class="rt"><div class="lb">${F.refs.title}</div><div class="tags">${F.refs.tags.map(x => `<span>${x}</span>`).join("")}</div></div><div class="swr">${F.refs.sw.map(s => `<div class="swc"><i style="background:${s[1]}"></i><div>${s[0]}<small>${s[2]}</small></div></div>`).join("")}</div><div class="thumbs">${F.refs.thumbs.map(([n, k]) => `<div class="thumb">${art(k, (t.id || "inv") + n, pal.acc, pal.acc2)}<span>${n}</span></div>`).join("")}</div><div class="reflink">${qr((t.id || "inv") + "board", { dark: qd })}<span>Full design board<br><b>${F.refs.link}</b></span></div></div>` : "";
  const mt = o.msg || "none", mtext = o.msgText ? o.msgText : msgDefault(mt, t);
  const reviewQrMarkup = reviewQrCustom
    ? `<img src="${reviewQrCustom}" alt="Rate us QR" style="width:40px;height:40px;object-fit:contain;background:#fff;border:1px solid #cbd5e1;border-radius:4px;padding:2px;box-sizing:border-box;" />`
    : qr((t.id || "inv") + "rev", { dark: qd });
  const message = mt === "none" ? "" : mt === "offer" ? `<div class="msg offer"><span><b>Thank you!</b> ${mtext}</span><span class="code">THANKS10</span></div>` : mt === "review" ? `<div class="msg">${reviewQrMarkup}<span><b>Rate us</b><br>${mtext}</span></div>` : `<div class="msg"><span><b>${mt === "social" ? "Stay in touch" : "Thank you"}</b><br>${mtext}</span></div>`;
  const seal = o.seal !== false ? `<span class="seal">✓ Verified</span><span>Scan the QR to check this invoice is genuine.</span>` : "";
  const strip = `<div class="st">${seal}<span>${lvl ? `GSTIN ${t.gstin || ""} · Reverse charge: ${c.rcm ? "Yes" : "No"} · ` : ""}${L("thanks")}${lvl ? ` · ${W ? W + " · " : ""}${F.social ? F.social + " · " : ""}Page 1 of 1` : ""}</span></div>`;
  const order = (o.blocks || Object.keys(BLOCKS).map(k => ({ k, on: true }))).filter(b => b.on !== false);
  const show = k => !((k === "details" || k === "terms") && !lvl) && !(k === "hsn" && !hsnT) && !(k === "refs" && !refsHtml);
  const flow = (mode, wrap = x => x) => order.filter(b => show(b.k)).map(b => {
    const k = b.k; let h = "";
    if (k === "parties") {
      if (mode.noParties) { const rest = partiesFrom(1); return rest ? wrap(`<div class="row">${rest}</div>`) : ""; }
      const all = partiesFrom(0), left = ps.length > 1 ? `<div class="row">${all}</div>` : all;
      if (mode.cards) return `<div class="row"><div class="cd">${left}</div><div class="cd accd ${A ? "hasart" : ""}">${A}${due}</div></div>`;
      h = mode.noDue ? left : `<div class="row${mode.boxes ? " boxes" : ""}">${all}${due}</div>`;
    }
    if (k === "details") h = details;
    if (k === "items") h = items;
    if (k === "summary") h = mode.noQr ? `<div class="row"><span></span>${totals}</div>` : `<div class="row">${pay}${totals}</div>`;
    if (k === "hsn") h = hsnT;
    if (k === "refs") h = refsHtml;
    if (k === "terms") h = terms;
    if (k === "signature") h = signature;
    if (k === "message") h = message;
    return h ? wrap(h) : "";
  }).join("");
  const strip0 = A ? `<div class="artstrip hasart">${A}</div>` : "";
  const cardWrap = x => `<div class="cd">${x}</div>`;
  let body = "";
  switch (o.l || "band") {
    case "band": body = `<div class="band ${A ? "hasart" : ""}">${A}${head}${title}</div><div class="pd col">${flow({})}${strip}</div>`; break;
    case "sidebar": body = `<div class="lay"><div class="sb ${A ? "hasart" : ""}">${A}${head}${party(ps[0], 0)}${due}${pay}</div><div class="main pd col">${title}${flow({ noParties: true, noQr: true })}${strip}</div></div>`; break;
    case "classic": body = `${strip0 || '<div class="topline"></div>'}<div class="pd col"><div class="row">${head}${title}</div>${flow({ boxes: true })}${strip}</div>`; break;
    case "minimal": body = `${strip0}<div class="pd col"><div class="row"><div><div class="topnm">${t.biz}</div><div class="bar"></div>${lvl ? `<div class="sm" style="margin-top:.5em">GSTIN ${t.gstin}${F.ids ? "<br>" + F.ids : ""}</div>` : ""}</div>${title}</div>${due}${flow({ noDue: true })}${strip}</div>`; break;
    case "hero": body = `<div class="pd col"><div class="row">${head}${title}</div><div class="herocard ${A ? "hasart" : ""}">${A}${due}${t.showUpiDetails === false ? "" : '<div class="paybtn">Pay by UPI →</div>'}</div>${flow({ noDue: true })}${strip}</div>`; break;
    case "split": body = `<div class="splt"><div class="artp ${A ? "hasart" : ""}">${A}<div class="nm"${R.fp.fdi ? ' style="font-style:italic"' : ""}>${t.biz}</div><div class="sm">${t.city}${lvl && F.ids ? "<br>" + F.ids : ""}</div></div><div class="pd">${title}${due}</div></div><div class="pd col">${flow({ noDue: true })}${strip}</div>`; break;
    case "receipt": body = `<div class="rc">${strip0}${head}${title}${flow({})}${strip}</div>`; break;
    case "editorial": body = `${strip0}<div class="pd col"><div class="row"><div class="ed">Invoice</div>${title}</div>${head}${flow({})}${strip}</div>`; break;
    case "cards": body = `<div class="pd col"><div class="cd row">${head}${title}</div>${flow({ cards: true }, cardWrap)}${strip}</div>`; break;
    case "frame": body = `<div class="fwrap ${A ? "hasart" : ""}">${A}<div class="fr"><div class="pd col"><div class="ctr">${head}<div class="orn">✦ ✦ ✦</div></div>${flow({})}${strip}</div></div></div>`; break;
    default: body = `<div class="band ${A ? "hasart" : ""}">${A}${head}${title}</div><div class="pd col">${flow({})}${strip}</div>`; break;
  }
  const rib = st === "overdue" ? `<div class="rib od"><span>Overdue by 12 days</span><span>Please pay ${fmt(c.due)} today</span></div>` : st === "part" ? `<div class="rib pp"><span>${fmt(c.paidPart)} paid</span><span class="bar"><i></i></span><span>${fmt(c.due)} left</span></div>` : "";
  return `<div class="ii L-${o.l || "band"} st-${st} paper-${R.paperKey}" style='${R.vars}--fz:${fz.toFixed(3)}cqw'>${rib}${body}${festBar(o.occ ?? t.occ, t)}${st === "paid" ? `<div class="stamp">PAID<small>16 Nov 2026 · UPI</small></div>` : ""}${st === "draft" ? `<div class="wm">DRAFT</div>` : ""}</div>`;
}

/* Phone format */
export function renderPhone(t, o = {}) {
  const R = resolve(t, o), { L, pal } = R, st = o.status || "sent", c = calc(t, st), F = c.F;
  const A = art(o.art ?? t.art, (t.id || "inv") + "ph" + (o.v || 0), pal.acc, pal.acc2);
  const rib = st === "overdue" ? `<div class="rib od">Overdue by 12 days</div>` : st === "part" ? `<div class="rib pp">${fmt(c.paidPart)} paid · ${fmt(c.due)} left</div>` : "";
  const lines = c.lines.map(l => `<div class="ln"><span>${l.desc}<small>${l.rate ? `${l.qty.toLocaleString("en-IN")} ${l.unit} × ${fmt(l.rate)}` : (l.sub || l.nw || "")}</small></span><span>${fmt(l.net)}</span></div>`).join("");
  const mt = o.msg || "none", mtext = o.msgText || msgDefault(mt, t);
  const reviewQrCustom = o.reviewQrImg || t.reviewQrImg || t.reviewQrUrl;
  const paymentQr = t.showUpiDetails === false ? null : (o.qrImg || t.qrImg || t.upiQrUrl);
  const reviewMessage = mt === "review" && reviewQrCustom
    ? `<div class="msgp" style="display:flex;align-items:center;gap:10px"><img src="${reviewQrCustom}" alt="Rate us QR" style="width:56px;height:56px;object-fit:contain;flex:none"/><span><b>Rate us</b><br>${mtext}</span></div>`
    : (mt !== "none" ? `<div class="msgp">${mtext}</div>` : "");
  return `<div class="ph" style='${R.vars}'>${rib}<div class="phero">${A}<div class="in"><span class="sm">${t.biz} · ${F.doc}</span><span class="sm">${st === "paid" ? "Paid in full" : L("due")} · ${st === "overdue" ? "was due 23 Oct" : (t.dueDate || "19 Nov 2026")}</span><span class="big">${fmt(st === "paid" ? c.total : c.due)}</span><span class="sm">${words(st === "paid" ? c.total : c.due)}</span></div></div>
  <div class="sec">${lines}<div class="ln"><span>GST${c.rcm ? " · paid by you under RCM" : ""}</span><span>${fmt(c.tax)}</span></div>${c.less.map(x => `<div class="ln"><span>${x.label}</span><span>−${fmt(x.amt)}</span></div>`).join("")}${c.adv ? `<div class="ln"><span>${c.advLbl}</span><span>−${fmt(c.adv)}</span></div>` : ""}</div>
  ${t.showUpiDetails === false ? "" : (st === "paid" ? `<div class="sec"><div class="ln"><b>Receipt</b><span>Paid 16 Nov · UPI</span></div></div>` : `<div class="sec"><div class="paybtn">Pay ${fmt(c.due)} with UPI</div><div class="alt"><span class="nofee">No fee</span><span>Card +2%</span><span>Bank transfer</span></div></div>`)}
  ${paymentQr ? `<div class="sec" style="display:grid;justify-items:center;gap:6px"><span>Scan to pay via UPI</span><img src="${paymentQr}" alt="UPI QR" style="width:88px;height:88px;object-fit:contain" /></div>` : ""}
  ${reviewMessage}
  <div class="sec" style="border:0">${o.seal !== false ? `<span class="seal">✓ Verified invoice · tap to check</span>` : ""}<div class="alt" style="justify-content:space-between"><span>Download PDF</span><span>GST details ›</span></div>${F.refs ? `<div class="alt"><span>View design board ›</span></div>` : ""}${F.web || F.social ? `<div class="alt"><span>${[F.web, F.social].filter(Boolean).join(" · ")}</span></div>` : ""}</div>
  ${festBar(o.occ ?? t.occ, t)}${st === "paid" ? `<div class="stamp">PAID</div>` : ""}</div>`;
}

/* Thermal 80mm format */
export function renderThermal(t, o = {}) {
  const st = o.status || "sent", c = calc(t, st), F = c.F, occ = o.occ ?? t.occ, mt = o.msg || "none", mtext = o.msgText || msgDefault(mt, t);
  const n2 = v => v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lines = c.lines.map(l => `<div>${l.desc}</div><div class="ln"><span>${l.rate ? `${l.qty.toLocaleString("en-IN")} ${l.unit} x ${l.rate.toLocaleString("en-IN")}` : (l.nw || "")}</span><span>${n2(l.net)}</span></div>`).join("");
  return `<div class="th"><div class="c b" style="font-size:1.15em">${t.biz}</div><div class="c">${t.city || ""}</div><div class="c">GSTIN ${t.gstin || "N/A"}</div>${F.ids ? `<div class="c">${F.ids}</div>` : ""}<div class="dl"></div><div class="c b">${F.doc.toUpperCase()}</div><div class="ln"><span>${t.invoiceNumber || "INV-001"}</span><span>${t.invoiceDate || "04-11-2026"}</span></div><div>To: ${F.parties[0].n}</div><div class="dl"></div>${lines}<div class="dl"></div>
  <div class="ln"><span>Taxable</span><span>${n2(c.taxable)}</span></div>${c.byRate.filter(b => b.r > 0).map(b => `<div class="ln"><span>${t.intra !== false ? "CGST+SGST" : "IGST"} ${b.r}%${c.rcm ? " RCM" : ""}</span><span>${n2(b.tax)}</span></div>`).join("")}<div class="ln big"><span>TOTAL</span><span>${fmt(c.total)}</span></div>${c.less.map(x => `<div class="ln"><span>${x.label}</span><span>-${n2(x.amt)}</span></div>`).join("")}${c.adv ? `<div class="ln"><span>Advance</span><span>-${c.adv.toLocaleString("en-IN")}</span></div>` : ""}<div class="ln b"><span>${st === "paid" ? "PAID" : "DUE"}</span><span>${fmt(st === "paid" ? c.total : c.due)}</span></div><div class="dl"></div>
  ${t.showUpiDetails === false ? "" : `<div class="c">Scan to pay by UPI</div>${qr((t.id || "inv") + "th", { dark: "#000", style: o.qr === "dots" ? "dots" : "classic", logoTxt: t.logo || "IN" })}<div class="c">${t.upi || "pay@upi"}</div><div class="dl"></div>`}${occ && occ !== "none" ? `<div class="c b">*** ${OCCDEF[occ].greet}! ***</div>` : ""}${mt !== "none" ? `<div class="c">${mtext}</div>` : ""}<div class="c">${o.seal !== false ? "Verify: invoxa.io/v/7F3K92" : ""}</div><div class="c">Thank you, visit again</div></div>`;
}

export const render = (t, o = {}) => {
  if (o.out === "phone") return renderPhone(t, o);
  if (o.out === "thermal") {
    let html = renderThermal(t, o);
    const paymentQr = t.showUpiDetails === false ? null : (o.qrImg || t.qrImg || t.upiQrUrl);
    const reviewQr = o.reviewQrImg || t.reviewQrImg || t.reviewQrUrl;
    if (paymentQr) {
      html = html.replace(/<svg[\s\S]*?<\/svg>/, `<img src="${paymentQr}" alt="UPI QR" style="width:96px;height:96px;object-fit:contain;justify-self:center" />`);
    }
    if (o.msg === "review" && reviewQr) {
      const reviewText = o.msgText || msgDefault("review", t);
      const reviewTextMarkup = `<div class="c">${reviewText}</div>`;
      html = html.replace(reviewTextMarkup, `<div class="c b">Rate us</div><img src="${reviewQr}" alt="Rate us QR" style="width:96px;height:96px;object-fit:contain;justify-self:center" />${reviewTextMarkup}`);
    }
    return html;
  }
  return renderA4(t, o);
};

/* Bridge from Invoxa Invoice object to Engine Template data format */
export function invoxaInvoiceToEngineTemplate(inv) {
  if (!inv) return STYLES[0];
  const tpl = inv.templateStyle || {};
  const seller = inv.seller || {};
  const client = inv.client || {};
  const payment = inv.paymentDetails || {};
  const showUpiDetails = Boolean(payment.upiId || seller.upiId || payment.upiQrUrl || inv.upiQrUrl);
  const showBankDetails = Boolean(payment.bankName || payment.accountNumber || payment.ifsc || payment.branch);
  const items = (inv.items || []).map(item => [
    item.description || item.name || "Item",
    item.hsnSac || item.hsn || "998314",
    parseFloat(item.quantity || item.qty || 1),
    parseFloat(item.rate || 0),
    item.unit || "nos",
    parseFloat(item.taxRate !== undefined ? item.taxRate : 18)
  ]);

  const sellerState = seller.state || tpl.state || "Maharashtra";
  const clientState = client.state || tpl.cstate || sellerState;
  const intra = sellerState.toLowerCase() === clientState.toLowerCase();

  const isCustomBiz = !!(seller.name) && seller.name !== "Sharma Interiors" && seller.name !== "Iyer & Associates";
  const templateKey = isCustomBiz ? "studio" : (tpl.id || inv.templateId || "studio");

  // Strip CA/domain-specific fields from tpl when this is a user's custom business
  const safeTpl = isCustomBiz ? {
    ...tpl,
    id: undefined,
    ids: undefined,
    desig: undefined,
    stampLbl: undefined,
    social: undefined,
    web: undefined,
    refs: undefined,
    meta: undefined,
    rows: undefined,
    notes: undefined,
    parties: undefined,
    doc: undefined,
    ack: undefined
  } : tpl;

  return {
    ...safeTpl,
    id: templateKey,
    isCustomInvoice: true,
    docType: inv.docType === 'quotation' ? 'quote' : (inv.docType || 'invoice'),
    showUpiDetails,
    showBankDetails,
    biz: seller.name || tpl.biz || "Krishna Enterprises",
    logo: (seller.name ? seller.name.slice(0, 2) : (tpl.logo || "KR")).toUpperCase(),
    logoImg: inv.logoImgUrl || inv.logoImg || tpl.logoImg || null,
    stamp: inv.stampStyle !== undefined ? inv.stampStyle : (tpl.stamp || "brand"),
    sig: inv.sigType || tpl.sig || "script",
    sigImg: inv.sigImgData || tpl.sigImg || null,
    upiQrUrl: payment.upiQrUrl || inv.upiQrUrl || tpl.qrImg || null,
    qrImg: payment.upiQrUrl || inv.upiQrUrl || tpl.qrImg || null,
    reviewQrUrl: inv.reviewQrUrl || tpl.reviewQrImg || null,
    reviewQrImg: inv.reviewQrUrl || tpl.reviewQrImg || null,
    seal: inv.verifiedSeal !== undefined ? inv.verifiedSeal : (tpl.seal !== undefined ? tpl.seal : true),
    ids: seller.pan ? "PAN " + seller.pan : "",
    city: [seller.address, seller.city, seller.state].filter(Boolean).join(", ") || tpl.city || "",
    gstin: seller.gstin || tpl.gstin || "",
    pos: `${clientState} (${client.pincode ? client.pincode.slice(0, 2) : '27'})`,
    fd: tpl.fd || "Fraunces",
    fb: tpl.fb || "Manrope",
    fn: tpl.fn || "IBM Plex Mono",
    ink: tpl.ink || "#151A2D",
    acc: inv.themeColor || tpl.acc || (inv.layout === 'classic' || inv.layout === 'receipt' || inv.layout === 'thermal' ? '#1e293b' : '#0E5E5A'),
    acc2: tpl.acc2 || (inv.layout === 'classic' || inv.layout === 'receipt' ? '#475569' : '#3FA79B'),
    soft: tpl.soft || (inv.layout === 'classic' || inv.layout === 'receipt' ? '#F8FAFC' : '#E6F2F0'),
    art: inv.artStyle || tpl.art || (inv.layout === 'classic' || inv.layout === 'receipt' || inv.layout === 'thermal' ? 'none' : 'waves'),
    client: client.name || tpl.client || "Customer",
    ccity: [client.address, client.city, client.state].filter(Boolean).join(", ") || tpl.ccity || "",
    cg: client.gstin || tpl.cg || "",
    gst: inv.items && inv.items[0] ? (inv.items[0].taxRate || 18) : (tpl.gst || 18),
    intra,
    invoiceNumber: inv.invoiceNumber || inv.quoteNumber || tpl.invoiceNumber || "INV-2026-001",
    invoiceDate: inv.invoiceDate || inv.quoteDate || tpl.invoiceDate || new Date().toISOString().split('T')[0],
    dueDate: inv.dueDate || inv.validUntil || tpl.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    po: tpl.po || inv.poNumber || "WO-2026-118",
    adv: parseFloat(tpl.adv !== undefined ? tpl.adv : (inv.advancePaid || 0)),
    board: tpl.board,
    site: tpl.site,
    stage: tpl.stage,
    items: items.length ? items : (tpl.items || [["Professional Services", "998314", 1, 1000, "nos", 18]]),
    sign: seller.authorizedSignatory || seller.name || tpl.sign || "Authorized Signatory",
    upi: payment.upiId || seller.upiId || "",
    bank: [payment.bankName || "", payment.accountNumber || "", payment.ifsc || "", payment.branch || ""],
    phone: seller.phone || tpl.phone || "",
    email: seller.email || tpl.email || ""
  };
}
