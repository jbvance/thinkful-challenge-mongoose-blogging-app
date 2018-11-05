const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const mongoose = require('mongoose');


const { Post, Author } = require('./models');

router.post('/', jsonParser, (req, res) => {

    const requiredFields = ['title', 'content', 'author_id'];
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            return res.status(400).json({
                message: 'Must include title, content, and author_id in body fields'
            });
        }
    })
    // Check for author_id
    Author.findById(req.body.author_id)
        .then(author => {
            if (author) {
                const {
                    title,
                    content,
                    author_id
                } = req.body;

                Post
                    .create({
                        title,
                        content,
                        author: author_id
                    })
                    .then(
                        post => res.status(201).json({
                            id: post.id,
                            author: `${author.firstName} ${author.lastName}`,
                            content: post.content,
                            title: post.title,
                            comments: post.comments
                        }))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({
                            message: 'Internal server error'
                        });
                    });
            } else {
                res.status(400).json({message: 'Author not found'})
            }
        })

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


router.get('/', (req, res) => {
    Post.find()
    .then(posts => {
        res.status(200).json(posts.map(post => {
            return {
                id: post._id,
                title: post.title,
                author: post.authorName,
                content: post.title
            }
        }));
    })
})


router.get('/:id', (req, res) => {
    const { id } = req.params;
    Post.findById(id)
    .then(post => {
        console.log("FOUND", post);
        if (!post) {
            const message = `No post found with id ${id}`;
            res.status(400).json({ message });
        }
        res.status(200).json({
            id: post._id,
            title: post.title,
            author: post.authorName,
            content: post.title,
            comments: post.comments
        });
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