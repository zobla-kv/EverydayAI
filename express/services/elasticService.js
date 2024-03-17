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

// index all/single product from firebase //
async function ingest(req, res, next) {
  console.log('fired')
  // this determines all or single
  const productId = req.params.id;

  let products;
  try {
    // products = productId ? [].concat(await firebaseService.getProductById(productId)) : await firebaseService.getAllProducts();
    products = [require('../mock/productResponse.json')[0]]
  } catch (err) {
    res.error = err;
    next();
  }


  console.log('elastic products: ', products);


  // index to elastic
  client.helpers.bulk({
    // only want fields that are being search
    datasource: products.map(product => ({ id: product.id, title: product.title, description: product.description })),
    onDocument (doc) {
      console.log('elastic onDocument: ', doc);
      // First, specify the action/metadata line
      const actionDescriptor = {
        index: {
          _index: indexName, // Make sure indexName is defined somewhere in your function
          _id: doc.id
        }
      };

      // Then, specify the document to index, excluding the ID since it's specified in the actionDescriptor
      const document = {
        title: doc.title,
        description: doc.description
      };

      // The Elasticsearch bulk helper will correctly format these as NDJSON
      return [
        actionDescriptor, // This line describes the action to be taken (indexing, in this case)
        document // This is the document to be indexed
      ];
    },
    onDrop (doc) {
      console.log('elastic onDrop: ', doc);
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
