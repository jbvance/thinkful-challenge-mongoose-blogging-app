const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('Blog Posts', function () {
    // Before our tests run, we activate the server. Our `runServer`
    // function returns a promise, and we return the that promise by
    // doing `return runServer`. If we didn't return a promise here,
    // there's a possibility of a race condition where our tests start
    // running before our server has started.
    before(function () {
        return runServer();
    });

    // although we only have one test module at the moment, we'll
    // close our server at the end of these tests. Otherwise,
    // if we add another test module that also has a `before` block
    // that starts our server, it will cause an error because the
    // server would still be running from the previous tests.
    after(function () {
        return closeServer();
    });

    // test strategy:
    //   1. make request to `/blog-posts`
    //   2. inspect response object and prove has right code and have
    //   right keys in response object.
    it('should list items on GET', function () {
        return chai
        .request(app)
        .get('/blog-posts')
        .then(function (res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body.length).to.be.at.least(1);

            const expectedKeys = ['title', 'content', 'author', 'publishDate'];
            res.body.forEach(function(item) {
                expect(item).to.be.a('Object');
                expect(item).to.include.keys(expectedKeys);
            });
        });
    });

    it ('should add an item on POST', function() {
        const newItem = { title: 'Test title', content: 'test content', author: 'test author' , publishDate: '12345'}
        return chai
        .request(app)
        .post('/blog-posts')
        .send(newItem)
        .then(function(res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('Object');
            expect(res.body).to.include.keys('title', 'content', 'author', 'publishDate');
            expect(res.body.id).to.not.equal(null);
            expect(res.body).to.deep.equal({ ...newItem, id: res.body.id});
        });
    });

    it ('should NOT add an item if data is missing', function() {
        const newItem = { title: 'Test title'}
        return chai
        .request(app)
        .post('/blog-posts')
        .send(newItem)
        .then(function(res) {
            expect(res).to.have.status(400);           
        });
    })

    it ('should update an item on PUT', function() {
        const updateData = {
            title: 'updated title',
            content: 'updated content',
            author: 'updated author'
        }
        return chai
        .request(app)
        .get('/blog-posts')
        .then(function(res) {
            updateData.id = res.body[0].id;
            return chai.request(app)
                .put(`/blog-posts/${updateData.id}`)
                .send(updateData)
        })
        .then(function(res) {
            expect(res).to.have.status(204);
        });
    });

    it ('should NOT update an item if data is missing', function() {
        const updateData = {
            title: 'updated title'          
        }
        return chai
        .request(app)
        .get('/blog-posts')
        .then(function(res) {
            updateData.id = res.body[0].id;
            return chai.request(app)
                .put(`/blog-posts/${updateData.id}`)
                .send(updateData)
        })
        .then(function(res) {
            expect(res).to.have.status(400);
        });
    });

    

    it ('should delete an item on DELETE', function() {    
        let deleteId;    
        return chai
        .request(app)
        .get('/blog-posts')
        .then(function(res) {
            deleteId = res.body[0].id;
            return chai.request(app)
                .delete(`/blog-posts/${deleteId}`)                
        })
        .then(function(res) {
            expect(res).to.have.status(204);
        });
    });


});