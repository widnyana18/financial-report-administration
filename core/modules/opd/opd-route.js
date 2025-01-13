const { Router } = require("express");

const opdController = require("./opd-controller");
const isAuth = require("../../common/middleware/is-auth");

const appRouter = Router();
const apiRouter = Router();

//root route opd
appRouter.get('/:id/edit-profile', isAuth, opdController.renderUpdateOpd);

//API
apiRouter.get('/', opdController.getAllOpd);
apiRouter.get('/:id', opdController.getOpd);
apiRouter.post('/edit/:id', isAuth, opdController.updateOpd);
apiRouter.delete('/delete/:id', isAuth, opdController.deleteOpd);

module.exports = {appRouter, apiRouter};


