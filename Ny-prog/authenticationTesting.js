import chai, {expect} from 'chai';
import chaiHttp from 'chai-http';

import app from './server.js';
import { it } from 'mocha';
import moment from "moment";

chai.use(chaiHttp);

// beskriver test-suite
describe('Authentication API', () => {
    // test case
    describe('POST /api/account/signup',  () => {
        // beskrivelse af testen formål
        it('should register a new user', (done) => {
            // unik nøgle
            const uniqueKey = moment().unix()
            chai.request(app) // http request via chai
            // udfører post anmodning
            .post('/api/account/signup')
            .send({ // data der sendes med
                email: `${uniqueKey}-jespertester@gmail.com`,
                password: '2468',
                name: 'Jesper Tester',
                age: 45,
                height: 150,
                weight: 160,
                gender: 'male'
            })
            .end((err, res) => { //afslutter anmodning
                if (err) return done(err); // hvis fejl retuner
                chai.expect(res).to.have.status(200);
                expect(res.body).to.have.property('message').equal('User registered successfully'); //forventning til resultat af testen
                done(); //test sluttes
            })
        });
        // besrkivelse af formål
        it('should return an error if an email already exsist', (done) => {
            chai.request(app)
            .post('/api/account/signup')
            .send({ // data der sendes med
                email: 'jespertester@gmail.com',
                password: '2468',
                name: 'Jesper Tester',
                age: 45,
                height: 150,
                weight: 160,
                gender: 'male'
            })
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(500);
                expect(res.body).to.have.property('error').equal('Email already exists'); // forventning til resultat
                done()
        })

        })
    })
        
    
})
