const { Router } = require("express");

const opdController = require("./opd-controller");

const appRouter = Router();
const apiRouter = Router();

//root route opd
appRouter.get('/:id', opdController.renderUpdateOpd);

//API
apiRouter.get('/', opdController.getOpd);
apiRouter.patch('/:id', opdController.updateOpd);
apiRouter.delete('/:id', opdController.deleteOpd);

module.exports = {appRouter, apiRouter};


