const app = require('./application')
const PORT = process.env.PORT || 8001;

//start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}...`);
})
