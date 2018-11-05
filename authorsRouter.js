const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { Author, Post } = require('./models');

router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['firstName', 'lastName', 'userName'];
    // Check all required fields are present
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            return res.status(400).json({
                message: 'Must include first name, last name, and username in body fields'
            });
        }
    });
       // Verify userName is unique
       const userName = req.body.userName
      Author.findOne({ userName: userName})
      .then(author => {         
          if (author) {
            return res.status(400).json({message: `Author with userName ${userName} already exists`})
          } else {
              Author.create({
                  firstName: req.body.firstName,
                  lastName: req.body.lastName,
                  userName: req.body.userName
              })
              .then(author => {
                  res.status(201).json({
                      id: author._id,
                      name: `${author.firstName} ${author.lastName}`,
                      userName: author.userName
                  })
              })
              .catch(err => {
                  console.error(err);
                  res.status(500).json({error: 'Error creating Author'})
              });
          }
      })
      .catch(err => {
          console.error(err);
          res.status(500).json({error: 'Error in verifying unique userName'})
      });
});

router.put('/:id', jsonParser, (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`);
        console.error(message);
       //exit function
        return res.status(400).json({
            message: message
        });
    }

    const toUpdate = {};
    const updateableFields = ['firstName', 'lastName', 'userName'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    Author.findOne({ userName: req.body.userName || '', _id: req.body.id})
    .then(author => {
        if (author){
            return res.status(400).json({message: `Author with userName ${author.userName} already exists`})
        } else {
            Author.findByIdAndUpdate(req.params.id, 
                { $set: toUpdate },
                { new: true }
            )
            .then(updated => {
                return res.status(200).json({
                    id: updated._id,
                    name: `${updated.firstName} ${updated.lastName}`,
                    userName: updated.userName
                })
            }).catch(err => {
                console.log(err);
                return res.status(500).json({ message: 'Error updating user information'})
            })
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({message: 'Error updating user'});
    })
   
})

router.delete('/:id', (req, res) => {

    Post.remove({ author: req.params.id})
    .then(() => {
        Author.findByIdAndRemove(req.params.id)
        .then(() => {
            return res.status(204).send();
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({message: 'Error deleting author and associated posts'});
    });

});

module.exports = router;

