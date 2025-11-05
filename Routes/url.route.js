import { Router } from 'express';
import urlController from '../controllers/url.controller.js';
import optionalAuth from '../middlewares/optAuth.js';
import requireAuth from '../middlewares/reqAuth.js';

const router = Router();

router.route('/cut')
    .post(optionalAuth, urlController.createUrl)

router.route('/goto/:urlCode')
    .get(optionalAuth, urlController.redirectUrl)

router.route('/delete/:urlId')
    .delete(requireAuth, urlController.deleteUrl);

export default router;
