const axios = require('axios');

async function testVapi() {
  try {
    const res = await axios.post(
      "https://api.vapi.ai/chat",
      {
        assistantId: "test-id",
        input: [{ role: "user", content: "hello" }]
      },
      {
        headers: {
          Authorization: `Bearer test`,
          "Content-Type": "application/json",
        }
      }
    );
    console.log("Success:", res.data);
  } catch (err) {
    console.log("Error status:", err.response?.status);
    console.log("Error data:", err.response?.data);
    console.log("Error message:", err.message);
  }
}

testVapi();
