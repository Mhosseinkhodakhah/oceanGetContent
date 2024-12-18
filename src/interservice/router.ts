import express , {Router} from 'express'
import interServiceController from './controller';


const interservice = Router();

const controller = new interServiceController

interservice.put('/put-content-photo/:contentId' , controller.putPhoto)

interservice.put('/reset-cache' , controller.resetCache )

interservice.get('/get-data-for-headers' , controller.getHeaderData)

export default interservice;