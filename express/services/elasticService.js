// Service for elastic search
const firebaseService = require('./firebaseService');
const { Client } = require('@elastic/elasticsearch');

// TODO: add auth and security for production
const client = new Client({
  node: process.env.ELASTIC_URL,
  // auth: {
  //     apiKey: process.env.ELASTIC_API_KEY
  //     username: '',
  //     password: ''
  // }
});

const indexName = 'everyday-ai-products';

// index all/single product from firebase //
async function ingest(req, res, next) {
  // this determines all or single
  const productId = req.params.id;

  let products;
  try {
    products = productId ? [].concat(await firebaseService.getProductById(productId)) : await firebaseService.getAllProducts();
  } catch (err) {
    res.error = err;
    next();
  }

  // index to elastic
  client.helpers.bulk({
    // only want fields that are being search
    datasource: products.map(product => ({ id: product.id, title: product.title, description: product.description })),
    onDocument (doc) {
      return [
        {
          index: {
            // it will create one if id does not exist
            _index: indexName,
            // create or update existing doc with this id
            _id : doc.id
          },
        },
        // update doc before writing - remove id because it is used only to assign doc.id
        { title: doc.title, description: doc.description }
      ]
    },
    onDrop (doc) {
      // on failure
      console.log('dropped: ', doc)
    }
  })
  .then(result => {
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
    res.error = err;
    next();
  })
}


// search for products by title or description
async function search(req, res, next) {
  const searchText = req.params.text.toLowerCase().trim();

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
    res.ids = matchingProductIds;
    next();
  })
  .catch(err => {
    res.error = err;
    next();
  })
}

module.exports = {
  ingest,
  search
}
