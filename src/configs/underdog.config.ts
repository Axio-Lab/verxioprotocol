import axios from "axios";

const underdog = axios.create({
    baseURL: "https://devnet.underdogprotocol.com",
    headers: {
        Authorization: `Bearer ${process.env.UNDERDOG_API_KEY}`,
    },
});


export default underdog;