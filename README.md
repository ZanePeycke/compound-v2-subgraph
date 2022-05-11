# Compound-V2-subgraph

[Compound](https://compound.finance/) is an open-source protocol for algorithmic, efficient Money Markets on the Ethereum blockchain. This Subgraph ingests the V2 contracts of the protocol.

## Networks and Performance

This subgraph can be found on [decentralized Graph Network](https://thegraph.com/explorer/subgraph?id=78SDqpEa8NorDfkJ9GDk1wUimsW6AKa53GWRbt83u18&view=Overview) and [the Graph's Hosted Service](https://thegraph.com/hosted-service/subgraph/zanepeycke/compound-v2-legacy).

The current versions of both subgraphs on the decentralized network and hosted service are deployed from [this commit](https://github.com/ZanePeycke/compound-v2-subgraph/commit/1cf9047f285679a91fa3c2bcbb88bf3eda61a72a). 


You can also run this subgraph locally, if you wish. Instructions for that can be found in [The Graph Documentation](https://thegraph.com/docs/quick-start).

### ABI

The ABI used is `ctoken.json`. It is a stripped down version of the full abi provided by compound, that satisfies the calls we need to make for both cETH and cERC20 contracts. This way we can use 1 ABI file, and one mapping for cETH and cERC20.

## Getting started with querying

Below are a few ways to show how to query the Compound V2 Subgraph for data. The queries show most of the information that is queryable, but there are many other filtering options that can be used, just check out the [querying api](https://github.com/graphprotocol/graph-node/blob/master/docs/graphql-api.md).

You can also see the saved queries on the hosted service for examples.


