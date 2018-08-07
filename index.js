const Joi = require('joi');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Course = require('./courses');

app.use(express.json());

mongoose.connect('mongodb+srv://vijaykumar:' + process.env.MONGO_ATLAS_PW + '@cluster0-mhhcs.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/api/courses', (req, res) => {
    Course.find().exec().then(docs => {
        console.log(docs);
        res.status(200).json(docs);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    })
});

app.get('/api/courses/:id', (req, res) => {
    const id = req.params.id;
    Course.findById(id).exec().then(doc => {
        console.log(doc);
        if (doc) {
            res.status(200).json(doc);
        } else {
            res.status(404).json({message: "No valid entry found for provided ID"});
        }
        res.status(200).send(doc);
    }).catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
})

app.post('/api/courses', (req, res) => {
    const { error } = validateCourse(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    const course = new Course({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name
    });
    course.save().then(result => {
        console.log(result);
    })
    .catch(err => console.log(err));
    res.status(201).json({
        message: "Handling Post requests to /courses",
        createdCourse: course 
    });
});

app.patch('/api/courses/:id', (req, res) => {
    const id = req.params.id;
    // Validate
    // If invalid return 400 - Bad request
    const { error } = validateCourse(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    const updateOps = {};
    for (const key of Object.keys(req.body)) {
        updateOps[key] = req.body[key];
    }
    // Update course
    Course.update({ _id: id }, { $set: updateOps }).exec().then(result => {
        console.log(result);
        res.status(200).json(result);
    }).catch(err => {
        res.status(500).json({error: err});
    });
});

function validateCourse(course) {
    const schema = {
        name: Joi.string().min(3).required()
    };

    return Joi.validate(course, schema);
}

app.delete('/api/courses/:id', (req, res) => {
    const id = req.params.id;
    Course.remove({_id: id}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        res.status(500).json({error: err});
    })
});

// PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));