import ServiceUsecase from "../usecase/service_usecase";
import { Status } from '../models/service_models';

class ServiceDelivery {
    async getStatus(req, res) {
        const response = await ServiceUsecase.getStatus();
        console.log(response)
        if (response === null) {
            res.code(400).send({ message: 'Bad Request' });
        } else {
            res.code(200).send(response);
        }
    }

    async clear(req, res) {
        const response = await ServiceUsecase.deleteAll();
        if (!response) {
            res.code(400).send({ message: 'Bad Request' });
        } else {
            res.code(200).send('');
        }
    }
}

export default new ServiceDelivery();
