const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const mainRouter = require('./routes/mainRouter')
const cors = require('cors')
const mongoose = require('mongoose');
const MONGOURI = process.env.MONGOURI;
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use('/api/v1', mainRouter)

mongoose.connect(MONGOURI)
.then(() => {
    console.log('Connected to MongoDB')
})
.catch((err) => {
    console.log(err)
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

