import axios from "axios";

let URL = 'https://apichallenges.herokuapp.com/';

export class ChallengesService {
    constructor (options){
        this.options = options;
    }
    async get(headers){
        const response = await axios.get(`${URL}challenges`, {headers: headers});
        return response;
    }
}