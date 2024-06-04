import e from 'express';
import { actionIndex, actionPrint } from './controllers';

const mainRoutes = e.Router();

mainRoutes.get('/', actionIndex);
mainRoutes.post('/print', actionPrint);

export default mainRoutes;
