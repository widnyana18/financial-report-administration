const { Router } = require("express");

const opdController = require("./opd-controller");

const appRouter = Router();
const apiRouter = Router();

//root route opd
appRouter.get('/:id', opdController.renderUpdateOpd);

//API
apiRouter.get('/', opdController.getAllOpd);
apiRouter.get('/:id', opdController.getOpd);
apiRouter.post('/edit/:id', opdController.updateOpd);
apiRouter.delete('/delete/:id', opdController.deleteOpd);

module.exports = {appRouter, apiRouter};


