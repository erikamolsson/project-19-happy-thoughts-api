import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import expressListEndpoints from "express-list-endpoints";
import dotenv from "dotenv";


dotenv.config();


const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo";
/* mongoose.connect(mongoUrl); */
mongoose.connect(mongoUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); 
  });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors({
  origin: "https://merry-buttercream-88f52d.netlify.app/",
  methods: ["GET", "POST"], 
  allowedHeaders: ["*"], 
}));

app.use(express.json());


// happyThought schema/model
const HappyThought = mongoose.model("HappyThought", new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140
  },
  hearts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: () => new Date()
  }
}))

// all routes/endpoints
app.get("/", (req, res) => {

  const endpoints = expressListEndpoints(app);
  res.json({
    message: "Endpoints for happy thought message:",
    description: {
      "/happythoughts": "all thoughts"
    },
    endpoints: endpoints
  });
});

// Get all happy thoughts
app.get("/happythoughts", async (req, res) => {
  try {
    const happyThoughts = await HappyThought.find().sort({createdAt: "desc"}).limit(20).exec();
    res.json(happyThoughts)
  } catch (error) {
    console.error('Error retrieving thoughts', error);
      res.status(500).send('Server error');
  }
});

// Post a happy thought
app.post("/happythoughts", async (req, res) => {
  try{
    const { message } = req.body;
    const newHappyThought = await new HappyThought ({ message }).save();

    res.status(201).json(newHappyThought);
  } catch(error) {
    res.status(400).json({message: "Could not save thought", errors: error.err.errors})
  }
});

// Post a happy thought
app.post("/happythoughts/:thoughtId/like", async (req, res) => {
  try {
    const { id } = req.params;

    // Uppdatera likes för den tanke som matchar ID
    const updatedThought = await Thought.findByIdAndUpdate(
      id,
      { $inc: { hearts: 1 } }, // Incrementera hearts med 1
      { new: true } // Returnera det uppdaterade dokumentet
    );

    if (!updatedThought) {
      return res.status(404).json({ success: false, message: 'Thought not found' });
    }

    res.status(200).json({ success: true, response: updatedThought });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
