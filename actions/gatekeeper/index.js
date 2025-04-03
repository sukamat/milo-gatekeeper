function main(params) {
  const name = params.name || 'Milo Indexer';
  return {
      statusCode: 200,
      body: {
          payload: `Hello ${name}`,
          params
      }
  };
}

exports.main = main;