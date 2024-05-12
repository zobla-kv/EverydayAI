const { OPEN_AI_API_KEY } = process.env;
const OpenAI = new require('openai');
const openAI = new OpenAI({
  apiKey: OPEN_AI_API_KEY
});

const IMAGE_SIZE = {
  mobile: '1024x1792',
  pc: '1792x1024'
}

// generate an image
// device - 'mobile' | 'pc', prompt - string
// return image_url - string
async function generateImage(device, prompt) {
  const response = await openAI.images.generate({
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: IMAGE_SIZE[device] ?? IMAGE_SIZE['mobile'],
  });

  image_url = response.data[0].url;

  return image_url;
}

module.exports = {
  generateImage
}

