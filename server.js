const express = require('express');
const tmrioAPI = require('./tmrioAPI');
const PORT = process.env.PORT || 3000;
require('dotenv').config();

const cors = require('cors');
const app = express();

app.use(cors());



app.get('/autoapi/:cityInput', async function (req,res) {
    let autoRes = await tmrioAPI.getAuto(req.params.cityInput);
    return res.send(autoRes);
})

app.get('/api/:loc', async function (req, res) {
    let weatherRes = await tmrioAPI.getWeatherInfo(req.params.loc);
    return res.send(weatherRes);
})
app.listen(PORT, () => {
    console.log(`Node server running on port ${PORT}`);
});