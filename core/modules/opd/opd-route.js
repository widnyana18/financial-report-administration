const { Router } = require("express");

const opdController = require("./opd-controller");
const isAuth = require("../../common/middleware/is-auth");

const appRouter = Router();
const apiRouter = Router();

//root route opd
appRouter.get('/:institutionName/edit-profile', isAuth, opdController.renderUpdateOpd);

//API
apiRouter.get('/', opdController.findManyOpd);
apiRouter.get('/:institutionName', opdController.getOpd);
apiRouter.post('/edit/:institutionName', isAuth, opdController.updateOpd);
apiRouter.delete('/delete/:institutionName', isAuth, opdController.deleteOpd);

module.exports = {appRouter, apiRouter};


