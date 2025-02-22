const { Router } = require("express");

const opdController = require("./opd-controller");
const isAuth = require("../../common/middleware/is-auth");

const appRouter = Router();
const apiRouter = Router();

//root route opd
appRouter.get('/:opdId/edit-profile', isAuth, opdController.renderUpdateOpd);

//API
apiRouter.get('/', opdController.findManyOpd);
apiRouter.get('/:opdId', opdController.getOpd);
apiRouter.post('/edit/:opdId', isAuth, opdController.updateOpd);
apiRouter.delete('/delete/:opdId', isAuth, opdController.deleteOpd);

module.exports = {appRouter, apiRouter};


