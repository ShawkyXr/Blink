import Url from '../models/url.model.js';
import { SUCCESS, FAIL, ERROR } from '../utils/httpStautsText.js';


const createUrl = async (req, res) => {
    try {
        let originalUrl = req.body.originalUrl;

        if (!originalUrl) {
            return res.status(400).json({ status: FAIL, message: 'originalUrl is required' });
        }

        if (!/^https?:\/\//i.test(originalUrl)) {
            originalUrl = 'https://' + originalUrl;
        }

        try {
            new URL(originalUrl);
        } catch {
            return res.status(400).json({ status: FAIL, message: 'Invalid URL format' });
        }
        
        const existingUrl = await Url.findOne({ originalUrl });
        if (existingUrl) {
            const userId = req.userId;
            
            if (userId) {
                if (!Array.isArray(existingUrl.sharedWith)) {
                    existingUrl.sharedWith = [];
                }
                if (!existingUrl.sharedWith.includes(userId) && existingUrl.userId?.toString() !== userId) {
                    existingUrl.sharedWith.push(userId);
                    await existingUrl.save();
                }
            }
            return res.status(200).json({ status: SUCCESS, data: existingUrl });
        }

        let shortUrl, urlCode;
        while (true) {
            urlCode = Math.random().toString(36).substring(2, 8);
            const tld = Math.random().toString(36).substring(2, 4) || 'io';
            shortUrl = `http://blink.${tld}/${urlCode}`;
            const existingShort = await Url.findOne({ shortUrl });
            if (!existingShort) break;
        }

        const newUrl = new Url({ 
            originalUrl,
            shortUrl,
            urlCode,
            userId: req.userId || null,
            createdAt: new Date(),
            expiresAt: req.userId ? null : new Date(Date.now() + 60 * 60 * 1000)
        });
        await newUrl.save();

        return res.status(201).json({ status: SUCCESS, data: newUrl });
        
    } catch (err) {
        return res.status(500).json({ status: ERROR, message: err.message });
    }
};


const redirectUrl = async (req, res) => {
    try {
        const urlCode = req.params.urlCode;

        const url = await Url.findOne({ urlCode });

        if (!url) {
            return res.status(404).json({ status: FAIL, message: 'URL not found' });
        }

        let redirectTo = url.originalUrl;
        if (!/^https?:\/\//i.test(redirectTo)) {
            redirectTo = 'https://' + redirectTo;
        }

        return res.redirect(301, redirectTo);
        
    } catch (err) {
        return res.status(500).json({ status: ERROR, message: err.message });
    }
};


export default {
    createUrl,
    redirectUrl
};