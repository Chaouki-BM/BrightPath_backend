const Utilisateur=require('../Models/Utilisateur.model')
const axios = require('axios');

const getAuthHeaders = () => {
  const credentials = `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`;
  const base64Credentials = Buffer.from(credentials).toString('base64');
  
  return {
    Authorization: `Basic ${base64Credentials}`,
    'Content-Type': 'application/json',
  };
};

// Generate Zoom OAuth access token
const generateAccessToken = async () => {
  try {
    const response = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      {}, // Zoom expects an empty body
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error generating access token:', error.response?.data || error.message);
    throw new Error('Access token generation failed');
  }
};

// Create Zoom meeting
exports.createMeeting = async (req, res) => {
  try {
    const accessToken = await generateAccessToken(); // Await the token

    const { topic, duration } = req.body;

    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        agenda: 'BrightPath Meeting',
        topic,
        type: 2, // Instant meeting
        duration,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(response)
    res.status(201).json({
      starturl: response.data.start_url,
      meetingId: response.data.id,
      joinUrl: response.data.join_url,
      password: response.data.password,
    });

  } catch (error) {
    console.error('Error creating meeting:', error.response?.data || error.message);
    res.status(500).json({ error: 'Meeting creation failed' });
  }
};