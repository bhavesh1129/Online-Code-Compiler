const Queue = require('bull');
const Job = require('./models/Job');
const { executeCpp } = require('./executeCpp');
const { executePy } = require('./executePy');

const jobQueue = new Queue('job-queue');
const NUM_WORKERS = 5;

jobQueue.process(NUM_WORKERS, async ({ data }) => {
    console.log(data);
    const { id: jobID } = data;
    const job = await Job.findById(jobID);
    if (job === undefined) {
        throw new Error("Job not found!");
    }
    console.log("Fetched Job", job);
    try {
        job["startedAt"] = new Date();
        if (job.language === "cpp") {
            output = await executeCpp(job.filePath);
        } else {
            output = await executePy(job.filePath);
        }
        job["completedAt"] = new Date();
        job["status"] = "success";
        job["output"] = output;
        await job.save();
    } catch (error) {
        job["completedAt"] = new Date();
        job["status"] = "error";
        job["output"] = JSON.stringify(error);
        await job.save();
    }
    return true;
});

jobQueue.on('failed', (error) => {
    console.log(error.data.id, "failed", error.failedReason);
});

const addJobToQueue = async (jobID) => {
    await jobQueue.add({ id: jobID });
};

module.exports = {
    addJobToQueue
};