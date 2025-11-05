import { Router } from 'express';
import urlController from '../controllers/url.controller.js';

const router = Router();

router.route('/')
    .get(urlController.getAllUrls)

router.route('/cut')
    .post(urlController.createUrl)

router.route('/:urlCode')
    .get(urlController.redirectUrl)

export default router;
