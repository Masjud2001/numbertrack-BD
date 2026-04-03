const express = require('express');
const axios = require('axios');
const geoip = require('geoip-lite');
const cors = require('cors');
const helmet = require('helmet');
const fetch = require('node-fetch');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Bangladeshi mobile number carriers regex
const BANGLADESH_MOBILE_PATTERNS = {
    '017': 'Grameenphone (GP)',
    '013': 'Banglalink',
    '019': 'Banglalink',
    '016': 'Airtel',
    '015': 'Teletalk',
    '018': 'Robi',
    '014': 'Robi'
};

// Phone number tracing (Bangladesh carriers)
app.post('/api/trace-phone', async (req, res) => {
    const { phone } = req.body;
    
    if (!phone || !/^\+?8801[3-9]\d{8}$/.test(phone.replace(/\s/g, ''))) {
        return res.json({ error: 'Invalid Bangladeshi mobile number' });
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    const prefix = cleanPhone.slice(3, 5); // Extract first 2 digits after 880
    const carrier = BANGLADESH_MOBILE_PATTERNS[prefix] || 'Unknown';
    
    // OSINT lookup for additional data
    const locationData = await getPhoneLocation(cleanPhone);
    
    res.json({
        phone: cleanPhone,
        carrier: carrier,
        prefix: prefix,
        location: locationData.location || 'Not available',
        approximate_area: locationData.area || 'Nationwide',
        status: 'success'
    });
});

// IP Geolocation + Carrier lookup
app.post('/api/trace-ip', async (req, res) => {
    const { ip } = req.body;
    
    if (!ip || !/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {
        return res.json({ error: 'Invalid IP address' });
    }
    
    // Basic GeoIP lookup
    const geo = geoip.lookup(ip);
    
    // Enhanced IP lookup via external APIs
    const ipData = await getIpDetails(ip);
    
    // Check if Bangladesh IP
    const isBangladesh = geo?.country === 'BD' || ipData.country === 'BD';
    
    res.json({
        ip: ip,
        country: geo?.country || ipData.country || 'Unknown',
        region: geo?.region || ipData.region,
        city: geo?.city || ipData.city,
        isp: ipData.isp || geo?.org || 'Unknown',
        latitude: geo?.ll[0] || ipData.lat,
        longitude: geo?.ll[1] || ipData.lon,
        is_bangladesh: isBangladesh,
        status: 'success'
    });
});

// Get visitor's IP automatically
app.get('/api/my-ip', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || 
               req.socket.remoteAddress || 
               req.connection.remoteAddress ||
               req.headers['x-real-ip'];
    
    res.json({ ip: ip.replace('::ffff:', '') });
});

async function getPhoneLocation(phone) {
    try {
        // Multiple OSINT sources for Bangladesh numbers
        const sources = [
            `https://api.apilayer.com/number_verification/validate?number=${phone}`,
            `http://api.apixu.com/v1/ip.json?key=YOUR_KEY&q=${phone}`
        ];
        
        // Mock enhanced lookup (replace with real APIs in production pentest)
        return {
            location: 'Dhaka Division',
            area: 'Urban area',
            accuracy: 'Carrier prefix based'
        };
    } catch (e) {
        return { location: null, area: null };
    }
}

async function getIpDetails(ip) {
    try {
        const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,isp,lat,lon,org,as`);
        return response.data;
    } catch (e) {
        return {};
    }
}

app.listen(3000, () => {
    console.log('Tracker running on http://localhost:3000');
});
