const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require("dotenv");
const mongoose = require('mongoose');
const Job = require('./models/Job');
const { generateFile } = require('./generateFile');
const { addJobToQueue } = require('./jobQueue');

dotenv.config();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


mongoose.set('strictQuery', false);
mongoose.connect(
    process.env.MONGODB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err) => {
        err && console.error(err);
        console.log("Successfully connected to MongoDB");
    }
);


app.get('/', (req, res) => {
    return res.send("Hello, world!");
});

app.post('/run', async (req, res) => {
    const { language = "cpp", code } = req.body;
    if (code === undefined) {
        return res.status(400).json({
            success: false,
            error: "Empty Code Body💀"
        })
    }
    let job;
    try {
        //need to create a c++ file with content from the request
        const filePath = await generateFile(language, code);
        if (!filePath) {
            return res.status(400).json({
                success: false,
                error: "Failed to generate file"
            });
        }
        //we need to run the file and send the response
        job = await new Job({ language, filePath }).save();
        const jobID = job["_id"];
        addJobToQueue(jobID);
        console.log(jobID);
        res.status(201).json({ success: true, jobID });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: JSON.stringify(error)
        });
    }
});

app.get("/status", async (req, res) => {
    const jobId = req.query.id;
    console.log("Status Request", jobId);

    if (jobId === undefined) {
        return res.status(400).json({
            success: false,
            error: "missing id query param"
        });
    }

    try {
        const job = await Job.findById(jobId);
        if (jobId === undefined) {
            return res.status(400).json({
                success: false,
                error: "Invalid Job ID"
            });
        }
        return res.status(200).json({ success: true, job });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: JSON.stringify(error)
        });
    }
});

app.listen(5000, () => {
    console.log("Server listening on port 5000!");
});