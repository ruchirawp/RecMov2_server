import axios from 'axios';

//get all liked movies of a specific user
export const getChatResults = async (req, res) => {
    try {
        const { message } = req.body;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-4o", 
                messages: [
                    { role: "system", content: " You personality is a movie and tv show lover. Keep your responses EXTREMELY concise and complete, as if you are sending a text message to a friend." },
                    { role: "user", content: message }
                ],
                max_tokens: 60,  // Adjust if responses are still cut off
                temperature: 0.3
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Accept": "application/json",
                    "Accept-Encoding": "identity", // Disable compression
                }
            }
        );

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
    console.error("Error fetching response:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || "Error fetching response" });
    }
  }

  export const testFunction2 = async (req,res) => {


    // try{
    //   res.status(200).json({ "nice": "its working" });
    // }
    // catch (err){
    //   res.status(404).json({ err: err.message });
    // }
    console.log("Using API Key:", process.env.OPENAI_API_KEY);

    try {
        const response = await axios.get("https://api.openai.com/v1/models", {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Accept": "application/json",
                "Accept-Encoding": "identity", // Disable compression
            },
        });
        console.log("Available Models:", response.data);
        res.status(200).json(response.data); // Send response back to client
    } catch (error) {
        console.error("Error fetching models:", error.response?.data || error.message);
        console.error("Raw error:", error); // Log raw error for debugging
        res.status(500).json({ error: error.response?.data || "Error fetching models" });
    }


}