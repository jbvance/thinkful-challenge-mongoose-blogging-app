const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const { Post } = require('./models');

router.post('/', jsonParser, (req, res) => {

    const requiredFields = ['title', 'content', 'author'];
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            console.error(message);
            return res.status(400).json({ message });
        }
    })

    const { title, content, author } = req.body;
  
    Post
      .create({
        title,
        content,
        author })
      .then(
        post => res.status(201).json(post.serialize()))
      .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
  });

router.put('/:id', jsonParser, (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`);
        console.error(message);
        // we return here to break out of this function
        return res.status(400).json({
            message: message
        });
    }

    const toUpdate = {};
    const updateableFields = ['title', 'author', 'content'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    Post.findByIdAndUpdate(req.params.id, 
        { $set: toUpdate}, 
        { new: true })
    .then(post => res.status(200).json(post.serialize()))
    .catch(err => res.status(500).json({
        message: 'Internal server error'
    }));
});


router.get('/:id', (req, res) => {
    const { id } = req.params;
    Post.findById(id)
    .then(post => {
        if (!post) {
            const message = `No post found with id ${id}`;
            res.status(400).json({ message });
        }
        res.status(200).json(post.serialize());
    })
    .catch(err => {
        console.error(err);
        res.status(400).json({message: `Unable to fetch post`})
    })
});

router.delete('/:id', (req, res) => {
    Post
      .findByIdAndRemove(req.params.id)
      .then(() => res.status(204).end())
      .catch(err => res.status(500).json({message: 'Internal server error'}));
  });

module.exports = router;