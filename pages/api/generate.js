const generateAction = async (req, res) => {
    console.log('Received request')

    console.log(process.env.HF_AUTH_KEY)

    const input = JSON.parse(req.body).input;

    // Add fetch request to Hugging Face
    const response = await fetch(
      `https://api-inference.huggingface.co/models/aiSportsGM/sd-1-5-cj`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_AUTH_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: input,
        }),
      }
    );

      // Check for different statuses to send proper payload
    if (response.ok) {
        const buffer = await response.arrayBuffer();
        res.status(200).json({ image: buffer });
    } else if (response.status === 503) {   
        const json = await response.json();
        res.status(503).json(json);
    } else {
        const json = await response.json();
        res.status(response.status).json({ error: response.statusText });
    }
  }
  
  export default generateAction;