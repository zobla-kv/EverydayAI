// Service for elastic search
const firebaseService = require('./firebaseService');
const { Client } = require('@elastic/elasticsearch');
const { ENV, ELASTIC_URL, ELASTIC_USERNAME, ELASTIC_PASSWORD } = process.env;

// TODO: update to use api key. Check postman collection
const client = new Client({
  node: ELASTIC_URL,
  auth: ENV === 'production' ? {
    username: ELASTIC_USERNAME,
    password: ELASTIC_PASSWORD
  } : null
});

const indexName = 'everyday-ai-images';

async function ingest(req, res, next) {
  try {
    const productId = req.params.id;

    const product = await firebaseService.getProductById(productId);

    const document = {
      index: indexName,
      id: product.id,
      body: {
        title: product.title,
        description: product.description,
      }
    };

    const result = await client.index(document);
    console.log("created a new index", result);
    res.result = result;
    next();

  } catch (error) {
    console.log('index err: ', error);
    res.error = error;
    next();
  }
}

// index all/single product from firebase
// TODO: not being in use but left for ref. if use try to refactor
async function ingestBulk(req, res, next) {
  // this determines all or single
  const productId = req.params.id;

  let products;

  try {
    products = productId ? [].concat(await firebaseService.getProductById(productId)) : await firebaseService.getAllProducts();
  } catch (err) {
    res.error = err;
    next();
  }

  client.bulk({
    datasource: products.map(product => ({ id: product.id, title: product.title, description: product.description })),
    onDocument (doc) {
      return [
        {
          index: {
            _index: indexName,
            _id: doc.id
          }
        },
        // this is how data is saved in elastic db, only fields that are being searched
        { title: doc.title, description: doc.description }
      ]
    },
    onDrop (doc) {
      // on failure
      console.log('dropped: ', doc)
    }
  })
  .then(result => {
    console.log('elastic then: ', result);
    // if single
    if (req.params.id) {
      result.successful === result.total ? res.result = result : res.error = result;
      next();
      return;
    }

    // if all
    res.result = result;
    next();
  })
  .catch(err => {
    console.log('elastic err: ', err);
    res.error = err;
    next();
  })
}


// search for products by title or description
async function search(req, res, next) {
  const searchText = req.params.text.toLowerCase().trim();

  console.log('searching for: ', searchText)

  await client.search({
    index: indexName,
    query: {
      query_string: {
        query: `*${searchText}*`,
        fields: ['title', 'description']
      }
    }
  })
  .then(result => {
    const matchingProductIds = result.hits.hits.map(doc => doc._id);
    console.log('result: ', result);
    res.ids = matchingProductIds;
    next();
  })
  .catch(err => {
    console.log('err: ', err);
    res.error = err;
    next();
  })
}

module.exports = {
  ingest,
  search
}
