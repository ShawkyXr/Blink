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

const deleteUrl = async (req, res) => {
    try {
        const urlId = req.params.urlId;
        const userId = req.userId;
        
        const url = await Url.findById(urlId);
        if (!url) {
            return res.status(404).json({ status: FAIL, message: 'URL not found' });
        }

        if (url.userId?.toString() !== userId) {
            const index = url.sharedWith.indexOf(userId);
            if (index > -1) {
                url.sharedWith.splice(index, 1);
                await url.save();
                return res.status(200).json({ status: SUCCESS, message: 'Access to URL removed' });
            } else {
                return res.status(403).json({ status: FAIL, message: 'You do not have permission to delete this URL' });
            }
        }

        if (url.sharedWith.length > 0) {
            url.userId = url.sharedWith[0];
            url.sharedWith.shift();
            await url.save();
            return res.status(200).json({ status: SUCCESS, message: 'URL ownership transferred' });
        }else{
            await Url.findByIdAndDelete(urlId);
            return res.status(200).json({ status: SUCCESS, message: 'URL deleted successfully' });
        }
    } catch (err) {
        return res.status(500).json({ status: ERROR, message: err.message });
    }
};

export default {
    createUrl,
    redirectUrl,
    deleteUrl
};