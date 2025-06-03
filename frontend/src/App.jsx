import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Container, Box, Typography, Grid, Paper, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Rating, Divider, Card, CardContent, CardHeader, Alert
} from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ReactMarkdown from 'react-markdown'
import './App.css'

// API base URL
const API_BASE_URL = 'http://localhost:5000/api'

// Sample text for quick testing
const SAMPLE_TEXT = `Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to intelligence displayed by animals and humans. Example tasks in which this is done include speech recognition, computer vision, translation between (natural) languages, as well as other mappings of inputs.

AI applications include advanced web search engines (e.g., Google), recommendation systems (used by YouTube, Amazon, and Netflix), understanding human speech (such as Siri and Alexa), self-driving cars (e.g., Waymo), generative or creative tools (ChatGPT and AI art), automated decision-making, and competing at the highest level in strategic game systems (such as chess and Go).

As machines become increasingly capable, tasks considered to require "intelligence" are often removed from the definition of AI, a phenomenon known as the AI effect. For instance, optical character recognition is frequently excluded from things considered to be AI, having become a routine technology.

Artificial intelligence was founded as an academic discipline in 1956, and in the years since it has experienced several waves of optimism, followed by disappointment and the loss of funding (known as an "AI winter"), followed by new approaches, success, and renewed funding. AI research has tried and discarded many different approaches, including simulating the brain, modeling human problem solving, formal logic, large databases of knowledge, and imitating animal behavior. In the first decades of the 21st century, highly mathematical and statistical machine learning has dominated the field, and this technique has proved highly successful, helping to solve many challenging problems throughout industry and academia.`

// Main App component
function App() {
  // State for model selection
  const [openSourceModels, setOpenSourceModels] = useState({})
  const [closedSourceModels, setClosedSourceModels] = useState({})
  const [selectedOpenModel, setSelectedOpenModel] = useState('')
  const [selectedClosedModel, setSelectedClosedModel] = useState('')
  
  // State for text input
  const [inputText, setInputText] = useState('')
  
  // State for summaries
  const [summaries, setSummaries] = useState({
    open_source: null,
    closed_source: null
  })
  
  // State for loading status
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // State for ratings
  const [ratings, setRatings] = useState({
    open_source: {
      clarity: 0,
      accuracy: 0,
      conciseness: 0
    },
    closed_source: {
      clarity: 0,
      accuracy: 0,
      conciseness: 0
    }
  })
  
  // State for preferred model
  const [preferredModel, setPreferredModel] = useState('')
  
  // State for submission status
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  
  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/models`)
        setOpenSourceModels(response.data.open_source)
        setClosedSourceModels(response.data.closed_source)
      } catch (err) {
        setError('Failed to fetch available models. Please make sure the backend server is running.')
        console.error('Error fetching models:', err)
      }
    }
    
    fetchModels()
  }, [])
  
  // Handle model selection
  const handleOpenModelChange = (event) => {
    setSelectedOpenModel(event.target.value)
  }
  
  const handleClosedModelChange = (event) => {
    setSelectedClosedModel(event.target.value)
  }
  
  // Handle text input change
  const handleTextChange = (event) => {
    setInputText(event.target.value)
  }
  
  // Load sample text
  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT)
  }
  
  // Handle form submission for summarization
  const handleSubmit = async () => {
    if (!inputText) {
      setError('Please enter some text to summarize')
      return
    }
    
    if (!selectedOpenModel && !selectedClosedModel) {
      setError('Please select at least one model')
      return
    }
    
    setIsLoading(true)
    setError(null)
    setSummaries({ open_source: null, closed_source: null })
    setRatings({
      open_source: { clarity: 0, accuracy: 0, conciseness: 0 },
      closed_source: { clarity: 0, accuracy: 0, conciseness: 0 }
    })
    setPreferredModel('')
    setRatingSubmitted(false)
    
    try {
      const response = await axios.post(`${API_BASE_URL}/summarize`, {
        text: inputText,
        open_model: selectedOpenModel,
        closed_model: selectedClosedModel
      })
      
      setSummaries(response.data)
    } catch (err) {
      setError('Error generating summaries. Please try again.')
      console.error('Error generating summaries:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle rating changes
  const handleRatingChange = (model, aspect, value) => {
    setRatings(prev => ({
      ...prev,
      [model]: {
        ...prev[model],
        [aspect]: value
      }
    }))
  }
  
  // Handle preferred model selection
  const handlePreferredModelChange = (event) => {
    setPreferredModel(event.target.value)
  }
  
  // Handle rating submission
  const handleSubmitRatings = async () => {
    try {
      await axios.post(`${API_BASE_URL}/save-rating`, {
        open_model: selectedOpenModel,
        closed_model: selectedClosedModel,
        ratings,
        preferred: preferredModel
      })
      
      setRatingSubmitted(true)
    } catch (err) {
      setError('Error submitting ratings. Please try again.')
      console.error('Error submitting ratings:', err)
    }
  }
  
  // Calculate average ratings for chart
  const getChartData = () => {
    const data = [
      {
        name: 'Clarity',
        'Open Source': ratings.open_source.clarity,
        'Closed Source': ratings.closed_source.clarity
      },
      {
        name: 'Accuracy',
        'Open Source': ratings.open_source.accuracy,
        'Closed Source': ratings.closed_source.accuracy
      },
      {
        name: 'Conciseness',
        'Open Source': ratings.open_source.conciseness,
        'Closed Source': ratings.closed_source.conciseness
      }
    ]
    
    return data
  }
  
  // Check if both summaries are available
  const bothSummariesAvailable = summaries.open_source && summaries.closed_source
  
  // Check if ratings are complete
  const ratingsComplete = () => {
    if (!bothSummariesAvailable) return false
    
    const openRatings = Object.values(ratings.open_source)
    const closedRatings = Object.values(ratings.closed_source)
    
    return (
      openRatings.every(rating => rating > 0) &&
      closedRatings.every(rating => rating > 0) &&
      preferredModel !== ''
    )
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Battle of the LLMs: Summarizer Showdown
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          1. Select Models
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Closed-source Model</InputLabel>
              <Select
                value={selectedClosedModel}
                onChange={handleClosedModelChange}
                label="Closed-source Model"
              >
                <MenuItem value="">None</MenuItem>
                {Object.entries(closedSourceModels).map(([id, name]) => (
                  <MenuItem key={id} value={id}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Open-source Model</InputLabel>
              <Select
                value={selectedOpenModel}
                onChange={handleOpenModelChange}
                label="Open-source Model"
              >
                <MenuItem value="">None</MenuItem>
                {Object.entries(openSourceModels).map(([id, name]) => (
                  <MenuItem key={id} value={id}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          2. Enter Text to Summarize
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={8}
          variant="outlined"
          placeholder="Paste or type a long article here (500-1000 words)"
          value={inputText}
          onChange={handleTextChange}
          sx={{ mb: 2 }}
        />
        
        <Button variant="outlined" onClick={handleLoadSample} sx={{ mr: 2 }}>
          Load Sample Text
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isLoading || (!selectedOpenModel && !selectedClosedModel) || !inputText}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Compare Summaries'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {(summaries.open_source || summaries.closed_source) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            3. Compare Summaries
          </Typography>
          
          <Grid container spacing={3}>
            {selectedOpenModel && summaries.open_source && (
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardHeader
                    title={openSourceModels[selectedOpenModel] || 'Open Source Model'}
                    subheader="Open Source"
                  />
                  <CardContent>
                    {summaries.open_source.error ? (
                      <Alert severity="error">{summaries.open_source.error}</Alert>
                    ) : (
                      <ReactMarkdown>{summaries.open_source.summary}</ReactMarkdown>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            {selectedClosedModel && summaries.closed_source && (
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardHeader
                    title={closedSourceModels[selectedClosedModel] || 'Closed Source Model'}
                    subheader="Closed Source"
                  />
                  <CardContent>
                    {summaries.closed_source.error ? (
                      <Alert severity="error">{summaries.closed_source.error}</Alert>
                    ) : (
                      <ReactMarkdown>{summaries.closed_source.summary}</ReactMarkdown>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
      
      {bothSummariesAvailable && !ratingSubmitted && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            4. Rate the Summaries
          </Typography>
          
          <Grid container spacing={3}>
            {selectedOpenModel && summaries.open_source && !summaries.open_source.error && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {openSourceModels[selectedOpenModel]}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Clarity</Typography>
                    <Rating
                      name="open-clarity"
                      value={ratings.open_source.clarity}
                      onChange={(_, value) => handleRatingChange('open_source', 'clarity', value)}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Accuracy</Typography>
                    <Rating
                      name="open-accuracy"
                      value={ratings.open_source.accuracy}
                      onChange={(_, value) => handleRatingChange('open_source', 'accuracy', value)}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Conciseness</Typography>
                    <Rating
                      name="open-conciseness"
                      value={ratings.open_source.conciseness}
                      onChange={(_, value) => handleRatingChange('open_source', 'conciseness', value)}
                    />
                  </Box>
                </Paper>
              </Grid>
            )}
            
            {selectedClosedModel && summaries.closed_source && !summaries.closed_source.error && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {closedSourceModels[selectedClosedModel]}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Clarity</Typography>
                    <Rating
                      name="closed-clarity"
                      value={ratings.closed_source.clarity}
                      onChange={(_, value) => handleRatingChange('closed_source', 'clarity', value)}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Accuracy</Typography>
                    <Rating
                      name="closed-accuracy"
                      value={ratings.closed_source.accuracy}
                      onChange={(_, value) => handleRatingChange('closed_source', 'accuracy', value)}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Conciseness</Typography>
                    <Rating
                      name="closed-conciseness"
                      value={ratings.closed_source.conciseness}
                      onChange={(_, value) => handleRatingChange('closed_source', 'conciseness', value)}
                    />
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Which model do you prefer overall?
            </Typography>
            
            <FormControl component="fieldset">
              <Select
                value={preferredModel}
                onChange={handlePreferredModelChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select your preferred model
                </MenuItem>
                {selectedOpenModel && summaries.open_source && !summaries.open_source.error && (
                  <MenuItem value="open_source">{openSourceModels[selectedOpenModel]}</MenuItem>
                )}
                {selectedClosedModel && summaries.closed_source && !summaries.closed_source.error && (
                  <MenuItem value="closed_source">{closedSourceModels[selectedClosedModel]}</MenuItem>
                )}
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitRatings}
                disabled={!ratingsComplete()}
              >
                Submit Ratings
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      
      {ratingSubmitted && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            5. Results
          </Typography>
          
          <Alert severity="success" sx={{ mb: 3 }}>
            Thank you for your ratings!
          </Alert>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Rating Comparison
            </Typography>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={getChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Open Source" fill="#8884d8" />
                <Bar dataKey="Closed Source" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Preferred Model:
              </Typography>
              <Typography variant="body1">
                {preferredModel === 'open_source' 
                  ? openSourceModels[selectedOpenModel]
                  : closedSourceModels[selectedClosedModel]}
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </Container>
  )
}

export default App
