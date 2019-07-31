import { Router } from 'express';
import * as controller from './hierarchySync.controller';

const router = new Router();

router.post('/hierarchy', controller.createHierarchy);

module.exports = router;
