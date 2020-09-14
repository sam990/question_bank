import express from 'express';
import mongodb from 'mongodb'; 
import cors from 'cors';

const { MongoClient } = mongodb;

const app = express()
const port = 3001;

MongoClient.connect('mongodb://localhost:27017/?poolSize=20&w=majority', { useUnifiedTopology: true })
.then(client => {
    const db = client.db('question_bank');
    const collection = db.collection('questions');

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json()); 
    app.use(cors());
    
    app.get('/api/search', (req, res) => {
        if (!req.query.keyword) {
            res.status(400).json('Bad request');
            return;
        }
        // get all results
        const query = { $or: [ { $text: { $search: req.query.keyword } }, { tags: req.query.keyword }]};
        
        // const query = { $text : { $search: req.query.keyword }};

        const cursor = collection.find(query);
        
        cursor.toArray().then( onfulfilled => {
            // sort the questions
            onfulfilled.sort((a, b) => {
                const freqA = a.query.split(req.body.keyword).length - 1;
                const freqB = b.query.split(req.body.keyword).length - 1;
                return freqA - freqB;
            });

            // return the questions in jSON Array
            res.status(200).json(onfulfilled);
        })
        .catch(e => { 
            console.error(e); 
            res.status(500).json('Internal Server Error');
        });
        
    });
    
    app.post('/api/insert', (req, res) => {
        if(!req.body.query || !req.body.topic || !req.body.tags) {
            res.status(400).json('Bad request');
            return;
        }
        // check question length
        // it should be more than  or equal to 10 letters
        if (req.body.query.length < 10) {
            res.status(400).json('Question too short');
            return;
        }
    
        // check topic length
        if (req.body.topic.length < 3) {
            res.status(400).json('Invalid Topic');
            return;
        }
    
        // check tags array length
        if (req.body.tags.length == 0) {
            res.status(400).json('Empty Tags');
            return;
        }
    
        // check if question already exists
       collection.findOne({ query: req.body.query })
       .then(result => {
           if (result != null) {
            res.status(400).json('Question Already Exists');
            return;
           }
           // insert the question
           collection.insertOne({
               query: req.body.query,
               topic: req.body.topic,
               tags: req.body.tags,
           })
           .then( onfulfilled => {
               res.status(200).json({ id: onfulfilled.ops[0]['_id']});
           })
           .catch(e => {
               console.error(e);
               res.status(500).json('Internal Server Error');
           })
       })
       .catch( e => {
           console.error(e);
           res.status(500).json('Internal Server Error');
        });
    });
    
})
.catch(console.error);


app.listen( port, () => { console.log('Started'); });
