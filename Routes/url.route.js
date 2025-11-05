import { Router } from 'express';
import urlController from '../controllers/url.controller.js';
import optionalAuth from '../middlewares/optAuth.js';

const router = Router();

router.route('/cut')
    .post(optionalAuth, urlController.createUrl)

router.route('/goto/:urlCode')
    .get(optionalAuth, urlController.redirectUrl)

export default router;
