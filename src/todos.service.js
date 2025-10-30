import axios from "axios";

let URL = 'https://apichallenges.herokuapp.com/';

export class TodosService {
    constructor (options){
        this.options = options;
    }
    async head(headers){
        const response = await axios.head(`${URL}todos`, {headers: headers});
        return response;
    }
    async get(headers){
        const response = await axios.get(`${URL}todos`, {headers: headers});
        return response;
    }
    async post(headers){
        const response = await axios.post(`${URL}todos`, {headers: headers});
        return response;
    }
    async delete(headers){
        const response = await axios.post(`${URL}todos`, {headers: headers});
        return response;
    }
}